"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { money } from "@/lib/data";
import {
  MODES,
  OTHER_COUNTRIES,
  PARCEL_OPTIONS,
  bookingSchema,
  fieldErrors,
  isUkMobile,
  suggestedTotal,
} from "@/lib/validation/booking";
import { createBooking, lookupCustomer } from "../actions";

const emptyValues = (today) => ({
  // Shipment
  mode: "air",
  parcels: "1",
  weight_kg: "",
  goods_description: "",
  goods_value_gbp: "",
  collection_date: today,
  // Invoicing
  rate_per_kg: "",
  other_charges: "0",
  total_charges: "",
  // Sender (UK)
  sender_name: "",
  sender_phone: "",
  sender_email: "",
  sender_address: "",
  sender_postcode: "",
  sender_town: "",
  // Receiver (overseas)
  receiver_country: "PK",
  receiver_name: "",
  receiver_phone: "",
  receiver_phone_alt: "",
  receiver_email: "",
  receiver_address: "",
  receiver_city: "",
});

function Section({ step, title, note, children }) {
  return (
    <section className="rounded-xl border border-line bg-white shadow-[0_18px_40px_-34px_rgba(22,35,60,0.45)]">
      <header className="flex items-start gap-[14px] border-b border-[#eef1f7] px-[22px] py-[18px] max-[520px]:px-4">
        <span className="mt-[2px] flex h-7 w-7 flex-none items-center justify-center rounded-full bg-green-soft font-head text-[13px] font-bold text-green-ink">
          {step}
        </span>
        <span>
          <h2 className="font-head text-[17px] font-bold text-ink">{title}</h2>
          {note && <p className="mt-[3px] text-[13.5px] text-soft">{note}</p>}
        </span>
      </header>
      <div className="px-[22px] py-[22px] max-[520px]:px-4">{children}</div>
    </section>
  );
}

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

function SubHead({ children, right }) {
  return (
    <div className="mb-[14px] flex flex-wrap items-center justify-between gap-3 border-b border-[#f1f4f9] pb-[10px]">
      <h3 className="text-xs font-semibold tracking-[0.08em] text-faint uppercase">{children}</h3>
      {right}
    </div>
  );
}

export default function BookingForm({ today }) {
  const [values, setValues] = useState(() => emptyValues(today));
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [created, setCreated] = useState(null);
  const [customerNote, setCustomerNote] = useState("");
  const [isPending, startTransition] = useTransition();

  // Once staff type their own figure into Total charges we stop overwriting
  // it, and offer the recalculated number as a nudge instead.
  const totalTouched = useRef(false);

  const suggestion = useMemo(
    () => suggestedTotal(values.weight_kg, values.rate_per_kg, values.other_charges),
    [values.weight_kg, values.rate_per_kg, values.other_charges]
  );

  const hasPricingInputs =
    values.weight_kg !== "" && values.rate_per_kg !== "" && values.other_charges !== "";

  const suggestionDiffers =
    hasPricingInputs && values.total_charges !== "" && Number(values.total_charges) !== suggestion;

  const overseas = values.receiver_country !== "PK";

  function setField(name, value) {
    setValues((prev) => {
      const next = { ...prev, [name]: value };
      // Keep the suggested total in step with its inputs until it's overridden.
      if (!totalTouched.current && ["weight_kg", "rate_per_kg", "other_charges"].includes(name)) {
        const ready = next.weight_kg !== "" && next.rate_per_kg !== "" && next.other_charges !== "";
        next.total_charges = ready
          ? String(suggestedTotal(next.weight_kg, next.rate_per_kg, next.other_charges))
          : "";
      }
      return next;
    });
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));
  }

  function applySuggestion() {
    totalTouched.current = false;
    setValues((prev) => ({ ...prev, total_charges: String(suggestion) }));
    setErrors((prev) => (prev.total_charges ? { ...prev, total_charges: undefined } : prev));
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
    setErrors((prev) => ({
      ...prev,
      receiver_country: undefined,
      receiver_phone: undefined,
      receiver_phone_alt: undefined,
    }));
  }

  // Returning customer? Fill the rest of the sender block in for them.
  function handlePhoneBlur() {
    if (!isUkMobile(values.sender_phone)) return;
    startTransition(async () => {
      const found = await lookupCustomer(values.sender_phone);
      if (!found) {
        setCustomerNote("");
        return;
      }
      setValues((prev) => ({
        ...prev,
        sender_name: found.name || prev.sender_name,
        sender_email: found.email || prev.sender_email,
        sender_address: found.address || prev.sender_address,
        sender_postcode: found.postcode || prev.sender_postcode,
        sender_town: found.town || prev.sender_town,
      }));
      setCustomerNote(`Existing customer — ${found.name}'s details filled in. Edit anything that has changed.`);
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    setFormError("");

    bookingSchema
      .validate(values, { abortEarly: false, stripUnknown: true })
      .then(() => {
        setErrors({});
        startTransition(async () => {
          const result = await createBooking(values);
          if (result?.error) {
            setFormError(result.error);
            if (result.fields) setErrors(result.fields);
            return;
          }
          setCreated(result.booking);
        });
      })
      .catch((err) => {
        setErrors(fieldErrors(err));
        setFormError("Please correct the highlighted fields.");
        document.querySelector("[data-invalid='true']")?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
  }

  function reset() {
    totalTouched.current = false;
    setValues(emptyValues(today));
    setErrors({});
    setFormError("");
    setCustomerNote("");
    setCreated(null);
  }

  const inputClass = (name, base = "input") =>
    `${base} ${errors[name] ? "border-red" : ""}`.trim();

  if (created) {
    return (
      <main className="min-h-screen bg-bg-soft px-5 py-16">
        <div className="mx-auto max-w-[560px] rounded-xl border border-line bg-white p-9 text-center shadow-[0_18px_40px_-34px_rgba(22,35,60,0.45)]">
          <span className="badge">Booking created</span>
          <p className="mt-5 text-[13.5px] font-semibold text-soft">Tracking reference</p>
          <p className="mt-1 font-head text-[44px] leading-none font-extrabold text-green">{created.reference}</p>
          <p className="mt-5 text-[15px] leading-[1.6] text-muted">
            The shipment and its invoice are saved. Give the customer this reference — they track with it and the
            mobile number on the booking.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <button className="btn btn-green" onClick={reset}>
              New booking
            </button>
            <Link className="btn btn-ghost" href="/admin">
              Back to admin
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg-soft pb-[120px]">
      <div className="sticky top-0 z-20 border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[980px] flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div>
            <Link className="text-[13px] font-semibold text-soft hover:text-ink" href="/admin">
              &larr; Admin
            </Link>
            <h1 className="mt-1 font-head text-[22px] font-extrabold text-ink">New booking</h1>
          </div>
          <p className="max-w-[46ch] text-[13px] text-soft">
            Creates the shipment and its invoice together. The reference is generated automatically.
          </p>
        </div>
      </div>

      <form className="mx-auto max-w-[980px] px-5 py-7" onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col gap-5">
          <Section step="1" title="Shipment details" note="How the goods travel, and what is in them.">
            <div className="grid-fields">
              <Field name="mode" error={errors.mode} label="Shipping">
                <select
                  className={inputClass("mode", "select")}
                  value={values.mode}
                  onChange={(e) => setField("mode", e.target.value)}
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
                >
                  {PARCEL_OPTIONS.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
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
                />
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
                />
              </Field>

              <Field name="collection_date" error={errors.collection_date} label="Collection date">
                <input
                  className={inputClass("collection_date")}
                  type="date"
                  value={values.collection_date}
                  onChange={(e) => setField("collection_date", e.target.value)}
                />
              </Field>

              <Field name="goods_description" error={errors.goods_description} label="Description of goods" wide>
                <textarea
                  className={inputClass("goods_description", "textarea")}
                  rows={3}
                  placeholder="Clothes, dry food and household items"
                  value={values.goods_description}
                  onChange={(e) => setField("goods_description", e.target.value)}
                />
              </Field>
            </div>
          </Section>

          <Section
            step="2"
            title="Invoicing and payment"
            note="Total is suggested as (rate × weight) + other charges — overwrite it if the customer agreed something different."
          >
            <div className="grid-fields">
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
                />
              </Field>

              <Field name="other_charges" error={errors.other_charges} label="Custom duty + handling + packing (£)">
                <input
                  className={inputClass("other_charges")}
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  placeholder="30.00"
                  value={values.other_charges}
                  onChange={(e) => setField("other_charges", e.target.value)}
                />
              </Field>

              <Field name="total_charges" error={errors.total_charges} label="Total charges (£)">
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
                />
              </Field>
            </div>

            {hasPricingInputs && (
              <p className="fine mt-[14px]">
                {values.weight_kg} kg × £{values.rate_per_kg || 0} + £{values.other_charges || 0} ={" "}
                <strong className="text-ink">£{money(suggestion)}</strong>
                {suggestionDiffers && (
                  <>
                    {" — "}
                    <button
                      type="button"
                      className="font-semibold text-green underline underline-offset-2"
                      onClick={applySuggestion}
                    >
                      use this total
                    </button>
                  </>
                )}
              </p>
            )}
          </Section>

          <Section step="3" title="Customer" note="Sender in the UK, receiver overseas.">
            <SubHead
              right={
                customerNote ? (
                  <span className="text-[12.5px] font-medium text-green-ink">{customerNote}</span>
                ) : (
                  <span className="text-[12px] font-normal text-faint">
                    Enter a mobile first to fill in a returning customer
                  </span>
                )
              }
            >
              Sender (UK)
            </SubHead>

            <div className="grid-fields">
              <Field name="sender_phone" error={errors.sender_phone} label="Sender mobile (UK)">
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
              </Field>

              <Field name="sender_name" error={errors.sender_name} label="Sender name">
                <input
                  className={inputClass("sender_name")}
                  placeholder="Full name"
                  value={values.sender_name}
                  onChange={(e) => setField("sender_name", e.target.value)}
                />
              </Field>

              <Field name="sender_email" error={errors.sender_email} label="Sender email" hint="optional">
                <input
                  className={inputClass("sender_email")}
                  type="email"
                  placeholder="name@example.com"
                  value={values.sender_email}
                  onChange={(e) => setField("sender_email", e.target.value)}
                />
              </Field>

              <Field name="sender_address" error={errors.sender_address} label="Sender address (UK)" wide>
                <input
                  className={inputClass("sender_address")}
                  placeholder="12 Example Road"
                  value={values.sender_address}
                  onChange={(e) => setField("sender_address", e.target.value)}
                />
              </Field>

              <Field name="sender_town" error={errors.sender_town} label="Town / city">
                <input
                  className={inputClass("sender_town")}
                  placeholder="Birmingham"
                  value={values.sender_town}
                  onChange={(e) => setField("sender_town", e.target.value)}
                />
              </Field>

              <Field name="sender_postcode" error={errors.sender_postcode} label="Postcode (UK)">
                <input
                  className={inputClass("sender_postcode")}
                  placeholder="B10 9AB"
                  value={values.sender_postcode}
                  onChange={(e) => setField("sender_postcode", e.target.value.toUpperCase())}
                />
              </Field>
            </div>

            <div className="mt-8">
              <SubHead
                right={
                  <button
                    type="button"
                    role="switch"
                    aria-checked={overseas}
                    onClick={toggleOverseas}
                    className="flex items-center gap-[9px] text-[12.5px] font-semibold text-muted normal-case"
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
                    Not in Pakistan
                  </button>
                }
              >
                Receiver ({overseas ? "overseas" : "Pakistan"})
              </SubHead>

              <div className="grid-fields">
                {overseas && (
                  <Field name="receiver_country" error={errors.receiver_country} label="Receiver country">
                    <select
                      className={inputClass("receiver_country", "select")}
                      value={values.receiver_country}
                      onChange={(e) => setField("receiver_country", e.target.value)}
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
                  />
                </Field>

                <Field
                  name="receiver_phone" error={errors.receiver_phone}
                  label={overseas ? "Receiver mobile" : "Receiver mobile (Pakistan)"}
                >
                  <input
                    className={inputClass("receiver_phone")}
                    type="tel"
                    inputMode="tel"
                    placeholder={overseas ? "+971 50 123 4567" : "0300 1234567"}
                    value={values.receiver_phone}
                    onChange={(e) => setField("receiver_phone", e.target.value)}
                  />
                </Field>

                <Field name="receiver_phone_alt" error={errors.receiver_phone_alt} label="Second receiver mobile" hint="optional">
                  <input
                    className={inputClass("receiver_phone_alt")}
                    type="tel"
                    inputMode="tel"
                    placeholder={overseas ? "+971 55 765 4321" : "0321 7654321"}
                    value={values.receiver_phone_alt}
                    onChange={(e) => setField("receiver_phone_alt", e.target.value)}
                  />
                </Field>

                <Field name="receiver_email" error={errors.receiver_email} label="Receiver email" hint="optional">
                  <input
                    className={inputClass("receiver_email")}
                    type="email"
                    placeholder="name@example.com"
                    value={values.receiver_email}
                    onChange={(e) => setField("receiver_email", e.target.value)}
                  />
                </Field>

                <Field name="receiver_address" error={errors.receiver_address} label="Receiver address" wide>
                  <input
                    className={inputClass("receiver_address")}
                    placeholder="House 5, Street 2, Model Town"
                    value={values.receiver_address}
                    onChange={(e) => setField("receiver_address", e.target.value)}
                  />
                </Field>

                <Field name="receiver_city" error={errors.receiver_city} label="City / district">
                  <input
                    className={inputClass("receiver_city")}
                    placeholder="Lahore"
                    value={values.receiver_city}
                    onChange={(e) => setField("receiver_city", e.target.value)}
                  />
                </Field>
              </div>
            </div>
          </Section>
        </div>

        {formError && <p className="alert alert-error">{formError}</p>}

        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-[980px] flex-wrap items-center justify-between gap-3 px-5 py-[14px]">
            <div className="flex items-baseline gap-[14px]">
              <span className="text-[13.5px] text-soft">Invoice total</span>
              <span className="font-head text-[24px] font-bold text-green">
                £{money(values.total_charges || 0)}
              </span>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link className="btn btn-ghost btn-sm" href="/admin">
                Cancel
              </Link>
              <button className="btn btn-green" type="submit" disabled={isPending}>
                {isPending ? "Saving…" : "Create booking"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </main>
  );
}
