"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { money } from "@/lib/data";
import { toWhatsAppNumber, whatsAppSendUrl } from "@/lib/whatsapp";
import {
  MODES,
  OTHER_COUNTRIES,
  PARCEL_OPTIONS,
  bookingSchema,
  fieldErrors,
  isUkMobile,
  suggestedTotal,
} from "@/lib/validation/booking";
import { createBooking, createInvoiceShareLink, lookupCustomer, updateBooking } from "./actions";

const emptyValues = (today) => ({
  mode: "air",
  parcels: "1",
  sender_name: "",
  sender_phone: "",
  sender_email: "",
  sender_address: "",
  sender_postcode: "",
  sender_town: "",
  receiver_country: "PK",
  receiver_name: "",
  receiver_phone: "",
  receiver_phone_alt: "",
  receiver_email: "",
  receiver_address: "",
  receiver_city: "",
  weight_kg: "",
  rate_per_kg: "",
  other_charges: "0",
  total_charges: "",
  goods_value_gbp: "",
  collection_date: today,
  goods_description: "",
});

// Defined at module scope, not inside BookingForm: a component declared
// inside the render body is a brand-new type on every render, so React
// unmounts and remounts each input and the field loses focus mid-typing.
function Field({ name, label, hint, error, children, wide }) {
  return (
    <label className={`field ${wide ? "col-[1/-1]" : ""}`} data-invalid={error ? "true" : undefined}>
      <span className="flex flex-wrap items-baseline justify-between gap-x-2">
        <span>{label}</span>
        {hint && <span className="text-[12px] font-normal text-faint">{hint}</span>}
      </span>
      {children}
      {error && <span className="text-[12.5px] font-medium text-red">{error}</span>}
    </label>
  );
}

// Serves both /admin/new-booking and /admin/shipments/[reference]/edit:
// `initial` and `reference` are absent when creating, present when editing.
export default function BookingForm({ today, initial = null, reference = null }) {
  const isEdit = Boolean(reference);
  const originalDate = initial?.collection_date || null;

  const [values, setValues] = useState(() => initial || emptyValues(today));
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [created, setCreated] = useState(null);
  const [copied, setCopied] = useState(false);
  const [shareError, setShareError] = useState("");
  const [customerNote, setCustomerNote] = useState("");
  const [isPending, startTransition] = useTransition();

  // Once staff type their own figure into Total charges we stop overwriting
  // it, and offer the recalculated number as a nudge instead. Editing starts
  // "touched": an existing total is a decision already made, not a draft.
  const totalTouched = useRef(isEdit);

  // A field is validated from the moment it is first blurred, and on every
  // keystroke after that — so errors appear when you leave a field, and clear
  // as soon as you fix it, rather than waiting for a failed submit.
  const touched = useRef(new Set());

  const validationContext = { originalDate: values.collection_date };

  const suggestion = useMemo(
    () => suggestedTotal(values.weight_kg, values.rate_per_kg, values.other_charges),
    [values.weight_kg, values.rate_per_kg, values.other_charges]
  );

  const hasPricingInputs =
    values.weight_kg !== "" && values.rate_per_kg !== "" && values.other_charges !== "";

  const suggestionDiffers =
    hasPricingInputs && values.total_charges !== "" && Number(values.total_charges) !== suggestion;

  const overseas = values.receiver_country !== "PK";

  // validateAt resolves conditional rules (receiver_phone depends on
  // receiver_country) against the whole object, so the full values are passed
  // even though only one field's message is wanted.
  function validateField(name, source) {
    bookingSchema
      .validateAt(name, source, { context: validationContext })
      .then(() => setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev)))
      .catch((err) => setErrors((prev) => ({ ...prev, [name]: err.message })));
  }

  function handleBlur(name) {
    touched.current.add(name);
    validateField(name, values);
  }

  function setField(name, value) {
    const next = { ...values, [name]: value };
    // Keep the suggested total in step with its inputs until it's overridden.
    if (!totalTouched.current && ["weight_kg", "rate_per_kg", "other_charges"].includes(name)) {
      const ready = next.weight_kg !== "" && next.rate_per_kg !== "" && next.other_charges !== "";
      next.total_charges = ready
        ? String(suggestedTotal(next.weight_kg, next.rate_per_kg, next.other_charges))
        : "";
    }
    setValues(next);

    if (touched.current.has(name)) validateField(name, next);
    else setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));

    // Changing the country changes which rule the mobiles are judged by.
    if (name === "receiver_country") {
      for (const dependent of ["receiver_phone", "receiver_phone_alt"]) {
        if (touched.current.has(dependent)) validateField(dependent, next);
      }
    }
  }

  function applySuggestion() {
    totalTouched.current = false;
    const next = { ...values, total_charges: String(suggestion) };
    setValues(next);
    if (touched.current.has("total_charges")) validateField("total_charges", next);
    else setErrors((prev) => (prev.total_charges ? { ...prev, total_charges: undefined } : prev));
  }

  function toggleOverseas() {
    setValues((prev) => ({
      ...prev,
      // Blank, not a guessed country — staff pick it, and the numbers are
      // cleared because a Pakistan number can't be valid under the new rule.
      receiver_country: prev.receiver_country === "PK" ? "" : "PK",
      receiver_phone: "",
      receiver_phone_alt: "",
    }));
    // Clearing the fields un-touches them: the blank they're looking at isn't
    // something they typed wrong, so it shouldn't be flagged red yet.
    touched.current.delete("receiver_phone");
    touched.current.delete("receiver_phone_alt");
    setErrors((prev) => ({
      ...prev,
      receiver_country: undefined,
      receiver_phone: undefined,
      receiver_phone_alt: undefined,
    }));
  }

  // Returning customer? Fill the rest of the sender block in for them.
  function handlePhoneBlur() {
    handleBlur("sender_phone");
    if (!isUkMobile(values.sender_phone)) return;
    startTransition(async () => {
      const found = await lookupCustomer(values.sender_phone);
      if (!found) {
        setCustomerNote("");
        return;
      }
      // Only blanks are filled. The name is typed before the mobile, so the
      // lookup fires after staff have already entered it — overwriting it
      // here would silently undo what they just typed.
      setValues((prev) => ({
        ...prev,
        sender_name: prev.sender_name || found.name || "",
        sender_email: prev.sender_email || found.email || "",
        sender_address: prev.sender_address || found.address || "",
        sender_postcode: prev.sender_postcode || found.postcode || "",
        sender_town: prev.sender_town || found.town || "",
      }));
      setCustomerNote(
        `Existing customer — ${found.name}. Remaining details filled in; anything you had already typed was left as it is.`
      );
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    setFormError("");

    bookingSchema
      .validate(values, { abortEarly: false, stripUnknown: true, context: validationContext })
      .then(() => {
        setErrors({});
        startTransition(async () => {
          const result = isEdit ? await updateBooking(reference, values) : await createBooking(values);
          if (result?.error) {
            setFormError(result.error);
            if (result.fields) setErrors(result.fields);
            return;
          }
          setCreated(result.booking);
        });
      })
      .catch((err) => {
        // Everything is touched once submit has been attempted, so fixing a
        // flagged field clears it immediately rather than on the next submit.
        for (const key of Object.keys(values)) touched.current.add(key);
        setErrors(fieldErrors(err));
        setFormError("Please correct the highlighted fields.");
        document.querySelector("[data-invalid='true']")?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
  }

  function reset() {
    totalTouched.current = false;
    touched.current = new Set();
    setValues(emptyValues(today));
    setErrors({});
    setFormError("");
    setCustomerNote("");
    setCreated(null);
  }

  const inputClass = (name, base = "input") => `${base} ${errors[name] ? "border-red" : ""}`.trim();

  // Dismissing after a new booking clears the form for the next one; after an
  // edit there is nothing to clear.
  const closeDialog = useCallback(() => {
    if (isEdit) setCreated(null);
    else reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit]);

  useEffect(() => {
    if (!created) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") closeDialog();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [created, closeDialog]);

  // Creates the customer link for the booking just made and opens WhatsApp
  // with it. The form still holds the submitted values at this point, so the
  // sender's name and number come from there rather than another fetch.
  function shareInvoice() {
    setShareError("");
    const number = toWhatsAppNumber(values.sender_phone);
    if (!number) {
      setShareError("That sender number isn't a UK mobile, so WhatsApp can't be opened for it.");
      return;
    }

    // Opened before the await: a tab opened afterwards counts as an
    // unrequested popup and gets blocked.
    const tab = window.open("", "_blank");

    startTransition(async () => {
      const result = await createInvoiceShareLink(created.reference, false);
      if (result?.error) {
        tab?.close();
        setShareError(result.error);
        return;
      }
      const message =
        `Hello ${values.sender_name}, your PAK Cargo invoice for shipment ${created.reference} is ready.\n\n` +
        `View or download it here: ${result.url}`;
      const url = whatsAppSendUrl(number, message);
      if (tab) tab.location.href = url;
      else window.open(url, "_blank", "noopener");
    });
  }

  async function copyReference() {
    const text = created.reference;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      // navigator.clipboard needs a secure context and permission, neither of
      // which is guaranteed on an office machine over plain http — fall back
      // to the old selection-based copy so the button always does something.
      try {
        const field = document.createElement("textarea");
        field.value = text;
        field.setAttribute("readonly", "");
        field.style.position = "fixed";
        field.style.opacity = "0";
        document.body.appendChild(field);
        field.select();
        document.execCommand("copy");
        document.body.removeChild(field);
        setCopied(true);
      } catch {
        setCopied(false);
      }
    }
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <main className="min-h-screen bg-bg-soft pb-10">
      <div className="sticky top-0 z-20 border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[980px] flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div>
            <Link
              className="text-[13px] font-semibold text-soft hover:text-ink"
              href={isEdit ? `/admin/shipments/${reference}` : "/admin?tab=ship"}
            >
              &larr; Back
            </Link>
            <h1 className="mt-1 font-head text-[22px] font-extrabold text-ink">
              {isEdit ? `Edit booking ${reference}` : "New booking"}
            </h1>
          </div>
          <p className="max-w-[46ch] text-[13px] text-soft">
            {isEdit
              ? "Updates the shipment, its invoice and the customer record together."
              : "Creates the shipment and its invoice together. The reference is generated automatically."}
          </p>
        </div>
      </div>

      <form className="mx-auto max-w-[980px] px-5 py-7" onSubmit={handleSubmit} noValidate>
        <div className="rounded-xl border border-line bg-white px-[26px] py-[26px] shadow-[0_18px_40px_-34px_rgba(22,35,60,0.45)] max-[520px]:px-4">
          <div className="grid-fields">
            <Field name="mode" error={errors.mode} label="Shipping">
              <select
                className={inputClass("mode", "select")}
                value={values.mode}
                onChange={(e) => setField("mode", e.target.value)}
                onBlur={() => handleBlur("mode")}
              >
                {MODES.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field name="parcels" error={errors.parcels} label="Number of parcels">
              <select
                className={inputClass("parcels", "select")}
                value={values.parcels}
                onChange={(e) => setField("parcels", e.target.value)}
                onBlur={() => handleBlur("parcels")}
              >
                {PARCEL_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </Field>

            <Field name="sender_name" error={errors.sender_name} label="Sender name">
              <input
                className={inputClass("sender_name")}
                placeholder="Full name"
                value={values.sender_name}
                onChange={(e) => setField("sender_name", e.target.value)}
                onBlur={() => handleBlur("sender_name")}
              />
            </Field>

            <Field
              name="sender_phone"
              error={errors.sender_phone}
              label="Sender mobile (UK)"
              hint={customerNote ? "returning customer" : undefined}
            >
              <input
                className={inputClass("sender_phone")}
                type="tel"
                inputMode="tel"
                autoComplete="off"
                placeholder="07700 900123"
                value={values.sender_phone}
                onChange={(e) => setField("sender_phone", e.target.value)}
                onBlur={handlePhoneBlur}
              />
              {customerNote && <span className="text-[12.5px] font-medium text-green-ink">{customerNote}</span>}
            </Field>

            <Field name="sender_email" error={errors.sender_email} label="Sender email" hint="optional">
              <input
                className={inputClass("sender_email")}
                type="email"
                placeholder="name@example.com"
                value={values.sender_email}
                onChange={(e) => setField("sender_email", e.target.value)}
                onBlur={() => handleBlur("sender_email")}
              />
            </Field>

            <Field name="sender_address" error={errors.sender_address} label="Sender address (UK)" wide>
              <input
                className={inputClass("sender_address")}
                placeholder="12 Example Road"
                value={values.sender_address}
                onChange={(e) => setField("sender_address", e.target.value)}
                onBlur={() => handleBlur("sender_address")}
              />
            </Field>

            <Field name="sender_town" error={errors.sender_town} label="Town / city">
              <input
                className={inputClass("sender_town")}
                placeholder="Birmingham"
                value={values.sender_town}
                onChange={(e) => setField("sender_town", e.target.value)}
                onBlur={() => handleBlur("sender_town")}
              />
            </Field>

            <Field name="sender_postcode" error={errors.sender_postcode} label="Postcode (UK)">
              <input
                className={inputClass("sender_postcode")}
                placeholder="B10 9AB"
                value={values.sender_postcode}
                onChange={(e) => setField("sender_postcode", e.target.value.toUpperCase())}
                onBlur={() => handleBlur("sender_postcode")}
              />
            </Field>

            <label className="field justify-end">
              <button
                type="button"
                role="switch"
                aria-checked={overseas}
                onClick={toggleOverseas}
                className="flex min-h-[46px] items-center gap-[10px] text-[13.5px] font-semibold text-muted"
              >
                <span
                  className={`relative h-[22px] w-[38px] flex-none rounded-full transition-colors ${
                    overseas ? "bg-green" : "bg-[#d7deea]"
                  }`}
                >
                  <span
                    className={`absolute top-[3px] h-4 w-4 rounded-full bg-white transition-all ${
                      overseas ? "left-[19px]" : "left-[3px]"
                    }`}
                  />
                </span>
                Receiver is not in Pakistan
              </button>
            </label>

            {overseas && (
              <Field name="receiver_country" error={errors.receiver_country} label="Receiver country">
                <select
                  className={inputClass("receiver_country", "select")}
                  value={values.receiver_country}
                  onChange={(e) => setField("receiver_country", e.target.value)}
                  onBlur={() => handleBlur("receiver_country")}
                >
                  <option value="">Select a country…</option>
                  {OTHER_COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </Field>
            )}

            <Field name="receiver_name" error={errors.receiver_name} label="Receiver name">
              <input
                className={inputClass("receiver_name")}
                placeholder="Full name"
                value={values.receiver_name}
                onChange={(e) => setField("receiver_name", e.target.value)}
                onBlur={() => handleBlur("receiver_name")}
              />
            </Field>

            <Field
              name="receiver_phone"
              error={errors.receiver_phone}
              label={overseas ? "Receiver mobile" : "Receiver mobile (Pakistan)"}
            >
              <input
                className={inputClass("receiver_phone")}
                type="tel"
                inputMode="tel"
                placeholder={overseas ? "+971 50 123 4567" : "0300 1234567"}
                value={values.receiver_phone}
                onChange={(e) => setField("receiver_phone", e.target.value)}
                onBlur={() => handleBlur("receiver_phone")}
              />
            </Field>

            <Field
              name="receiver_phone_alt"
              error={errors.receiver_phone_alt}
              label="Second receiver mobile"
              hint="optional"
            >
              <input
                className={inputClass("receiver_phone_alt")}
                type="tel"
                inputMode="tel"
                placeholder={overseas ? "+971 55 765 4321" : "0321 7654321"}
                value={values.receiver_phone_alt}
                onChange={(e) => setField("receiver_phone_alt", e.target.value)}
                onBlur={() => handleBlur("receiver_phone_alt")}
              />
            </Field>

            <Field name="receiver_email" error={errors.receiver_email} label="Receiver email" hint="optional">
              <input
                className={inputClass("receiver_email")}
                type="email"
                placeholder="name@example.com"
                value={values.receiver_email}
                onChange={(e) => setField("receiver_email", e.target.value)}
                onBlur={() => handleBlur("receiver_email")}
              />
            </Field>

            <Field name="receiver_address" error={errors.receiver_address} label="Receiver address" wide>
              <input
                className={inputClass("receiver_address")}
                placeholder="House 5, Street 2, Model Town"
                value={values.receiver_address}
                onChange={(e) => setField("receiver_address", e.target.value)}
                onBlur={() => handleBlur("receiver_address")}
              />
            </Field>

            <Field name="receiver_city" error={errors.receiver_city} label="City / district">
              <input
                className={inputClass("receiver_city")}
                placeholder="Lahore"
                value={values.receiver_city}
                onChange={(e) => setField("receiver_city", e.target.value)}
                onBlur={() => handleBlur("receiver_city")}
              />
            </Field>

            <Field name="weight_kg" error={errors.weight_kg} label="Total weight (kg)">
              <input
                className={inputClass("weight_kg")}
                type="number"
                min="0"
                step="0.1"
                inputMode="decimal"
                placeholder="24.5"
                value={values.weight_kg}
                onChange={(e) => setField("weight_kg", e.target.value)}
                onBlur={() => handleBlur("weight_kg")}
              />
            </Field>

            <Field name="rate_per_kg" error={errors.rate_per_kg} label="Rate per kg (£)">
              <input
                className={inputClass("rate_per_kg")}
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                placeholder="3.10"
                value={values.rate_per_kg}
                onChange={(e) => setField("rate_per_kg", e.target.value)}
                onBlur={() => handleBlur("rate_per_kg")}
              />
            </Field>

            <Field
              name="other_charges"
              error={errors.other_charges}
              label="Custom duty + handling + packing (£)"
            >
              <input
                className={inputClass("other_charges")}
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                placeholder="30.00"
                value={values.other_charges}
                onChange={(e) => setField("other_charges", e.target.value)}
                onBlur={() => handleBlur("other_charges")}
              />
            </Field>

            <Field
              name="total_charges"
              error={errors.total_charges}
              label="Total charges (£)"
              hint={hasPricingInputs ? `suggested £${money(suggestion)}` : undefined}
            >
              <input
                className={inputClass("total_charges")}
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                placeholder="105.95"
                value={values.total_charges}
                onChange={(e) => {
                  totalTouched.current = true;
                  setField("total_charges", e.target.value);
                }}
                onBlur={() => handleBlur("total_charges")}
              />
              {suggestionDiffers && (
                <button
                  type="button"
                  className="self-start text-[12.5px] font-semibold text-green underline underline-offset-2"
                  onClick={applySuggestion}
                >
                  Use £{money(suggestion)} ({values.weight_kg} kg × £{values.rate_per_kg} + £{values.other_charges})
                </button>
              )}
            </Field>

            <Field name="goods_value_gbp" error={errors.goods_value_gbp} label="Worth of goods (£)">
              <input
                className={inputClass("goods_value_gbp")}
                type="number"
                min="1"
                step="0.01"
                inputMode="decimal"
                placeholder="250"
                value={values.goods_value_gbp}
                onChange={(e) => setField("goods_value_gbp", e.target.value)}
                onBlur={() => handleBlur("goods_value_gbp")}
              />
            </Field>

            {/* Fixed, never typed. The value shown comes from the server (see
                lib/server-time.js) and the Server Action sets it again from the
                same source, so a disabled input here is presentation, not the
                control that actually enforces it. */}
            <Field
              name="collection_date"
              error={errors.collection_date}
              label="Collection date"
              hint={isEdit ? "as booked" : "today"}
            >
              <input
                className="input cursor-not-allowed bg-[#f4f7fb] text-muted"
                type="date"
                value={values.collection_date}
                disabled
                readOnly
              />
            </Field>

            <Field name="goods_description" error={errors.goods_description} label="Description of goods" wide>
              <textarea
                className={inputClass("goods_description", "textarea")}
                rows={3}
                placeholder="Clothes, dry food and household items"
                value={values.goods_description}
                onChange={(e) => setField("goods_description", e.target.value)}
                onBlur={() => handleBlur("goods_description")}
              />
            </Field>
          </div>

          {/* In normal flow at the end of the form, not pinned to the
              viewport: the actions belong after the last field, and a fixed
              bar covers content on short screens. */}
          <div className="mt-[26px] flex flex-wrap items-center justify-between gap-4 border-t border-[#eef1f7] pt-[22px]">
            <div className="flex items-baseline gap-[14px]">
              <span className="text-[13.5px] text-soft">Invoice total</span>
              <span className="font-head text-[24px] font-bold text-green">
                £{money(values.total_charges || 0)}
              </span>
            </div>
            <div className="flex flex-wrap gap-3 max-[520px]:w-full max-[520px]:flex-col-reverse">
              <Link
                className="btn btn-ghost max-[520px]:w-full"
                href={isEdit ? `/admin/shipments/${reference}` : "/admin?tab=ship"}
              >
                Cancel
              </Link>
              <button className="btn btn-green max-[520px]:w-full" type="submit" disabled={isPending}>
                {isPending ? "Saving…" : isEdit ? "Save changes" : "Create booking"}
              </button>
            </div>
          </div>
        </div>

        {formError && <p className="alert alert-error">{formError}</p>}
      </form>

      {created && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 px-5 py-8 backdrop-blur-[2px]"
          // Only a click on the backdrop itself closes it — without the target
          // check, a click that starts inside the card and drifts out would too.
          onClick={(e) => {
            if (e.target === e.currentTarget) closeDialog();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-created-title"
            className="relative w-full max-w-[460px] rounded-xl border border-line bg-white p-8 text-center shadow-[0_30px_70px_-30px_rgba(22,35,60,0.6)] max-[520px]:p-6"
          >
            <button
              type="button"
              aria-label="Close"
              onClick={closeDialog}
              className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-md text-xl leading-none text-faint hover:bg-bg-soft hover:text-ink"
            >
              &times;
            </button>

            <span className="badge">{isEdit ? "Changes saved" : "Invoice created"}</span>

            <h2 id="booking-created-title" className="mt-4 font-head text-[19px] font-bold text-ink">
              {isEdit ? "Booking updated" : "The booking and its invoice are saved"}
            </h2>

            <p className="mt-[18px] text-[13px] font-semibold tracking-[0.06em] text-faint uppercase">
              Invoice number
            </p>
            <p className="mt-1 font-head text-[42px] leading-none font-extrabold text-green">{created.reference}</p>
            <p className="mt-4 text-[14.5px] leading-[1.6] text-muted">
              The customer tracks with this number and the mobile on the booking.
            </p>

            <div className="mt-7 flex flex-col gap-[10px]">
              <button type="button" className="btn btn-green w-full" disabled={isPending} onClick={shareInvoice}>
                {isPending ? "Preparing link…" : "Share invoice on WhatsApp"}
              </button>
              <button type="button" className="btn btn-ghost w-full" onClick={copyReference}>
                {copied ? "Copied to clipboard" : "Copy invoice number"}
              </button>
              <Link className="btn btn-ghost w-full" href={`/admin/shipments/${created.reference}`}>
                Go to shipment details
              </Link>
            </div>
            {shareError && <p className="alert alert-error text-left">{shareError}</p>}
          </div>
        </div>
      )}
    </main>
  );
}
