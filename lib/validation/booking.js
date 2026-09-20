// Validation for the staff booking form (shipment + invoicing + customer),
// written once and run twice: in the browser for live field errors, and again
// inside the Server Action. The second run is not belt-and-braces -- a Server
// Action is a public HTTP endpoint in its own right, so anything validated
// only on the client can be skipped entirely by posting to it directly.
//
// Phone numbers are normalized to one canonical form before they reach the
// database: UK senders as 07xxxxxxxxx, overseas receivers as +CC.... That is
// what makes "07700 900001", "+44 7700 900001" and "0044 7700 900001" resolve
// to the same returning customer instead of creating three of them.

import * as yup from "yup";

export const MODES = [
  { value: "air", label: "Air" },
  { value: "sea", label: "Sea" },
];

export const PARCEL_OPTIONS = Array.from({ length: 30 }, (_, i) => i + 1);

// Shown only when staff flip the "receiver is not in Pakistan" toggle. A short
// list of realistic destinations rather than all ~200 countries -- the dialling
// code in the phone number carries the detail anyway, so "XX" (Other) loses
// nothing that matters.
export const OTHER_COUNTRIES = [
  { code: "AE", label: "United Arab Emirates" },
  { code: "SA", label: "Saudi Arabia" },
  { code: "IN", label: "India" },
  { code: "BD", label: "Bangladesh" },
  { code: "US", label: "United States" },
  { code: "CA", label: "Canada" },
  { code: "AU", label: "Australia" },
  { code: "DE", label: "Germany" },
  { code: "FR", label: "France" },
  { code: "ES", label: "Spain" },
  { code: "IT", label: "Italy" },
  { code: "XX", label: "Other" },
];

const digitsOf = (value) => String(value ?? "").replace(/\D/g, "");

// ------------------------------------------------------------------ phones

export function normalizeUkMobile(value) {
  const d = digitsOf(value);
  if (d.length === 14 && d.startsWith("0044")) return `0${d.slice(4)}`;
  if (d.length === 12 && d.startsWith("44")) return `0${d.slice(2)}`;
  return d;
}

// UK mobiles only -- 07xxx xxxxxx. Landlines are rejected on purpose: this is
// the number the customer verifies their tracking with, so it has to be a
// phone they carry.
export const isUkMobile = (value) => /^07\d{9}$/.test(normalizeUkMobile(value));

export function normalizePkMobile(value) {
  const d = digitsOf(value);
  if (d.length === 14 && d.startsWith("0092")) return `+${d.slice(2)}`;
  if (d.length === 12 && d.startsWith("92")) return `+${d}`;
  if (d.length === 11 && d.startsWith("03")) return `+92${d.slice(1)}`;
  return d ? `+${d}` : "";
}

export const isPkMobile = (value) => /^\+923\d{9}$/.test(normalizePkMobile(value));

export function normalizeInternational(value) {
  let d = digitsOf(value);
  if (d.startsWith("00")) d = d.slice(2);
  return d ? `+${d}` : "";
}

// E.164: a country code plus subscriber number, 8-15 digits all in.
export const isInternational = (value) => /^\+\d{8,15}$/.test(normalizeInternational(value));

export const normalizeReceiverPhone = (value, country) =>
  country === "PK" ? normalizePkMobile(value) : normalizeInternational(value);

// ---------------------------------------------------------------- postcode

const UK_POSTCODE = /^[A-Z]{1,2}\d[A-Z\d]?\d[A-Z]{2}$/;

export function formatPostcode(value) {
  const squashed = String(value ?? "").toUpperCase().replace(/\s+/g, "");
  return squashed.length > 3 ? `${squashed.slice(0, -3)} ${squashed.slice(-3)}` : squashed;
}

export const isUkPostcode = (value) =>
  UK_POSTCODE.test(String(value ?? "").toUpperCase().replace(/\s+/g, ""));

// ----------------------------------------------------------------- pricing

export const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

// The figure the Total charges field is prefilled with. Staff can overwrite
// it -- the stored total is whatever they submit, not a recomputation.
export const suggestedTotal = (weight, ratePerKg, otherCharges) =>
  round2((Number(weight) || 0) * (Number(ratePerKg) || 0) + (Number(otherCharges) || 0));

// ------------------------------------------------------------------ schema

// Text inputs hand back strings, so every numeric field strips "£", commas and
// spaces first and reports a NaN as a type error rather than silently
// becoming 0 -- an empty rate quietly pricing a shipment at zero is exactly
// the bug this avoids.
const numberField = () =>
  yup.number().transform((_value, original) => {
    if (original === null || original === undefined) return undefined;
    const raw = String(original).replace(/[£,\s]/g, "");
    if (raw === "") return undefined;
    return Number.isFinite(Number(raw)) ? Number(raw) : NaN;
  });

const text = (max, label) =>
  yup.string().trim().max(max, `${label} cannot be longer than ${max} characters.`);

const optionalText = (max, label) => text(max, label).nullable().transform((v) => v || "");

export const bookingSchema = yup.object({
  // -- Shipment ------------------------------------------------------------
  mode: yup
    .string()
    .oneOf(["air", "sea"], "Choose air or sea.")
    .required("Choose a shipping method."),
  parcels: numberField()
    .typeError("Number of parcels must be a number.")
    .integer("Number of parcels must be a whole number.")
    .min(1, "At least 1 parcel.")
    .max(30, "Up to 30 parcels.")
    .required("Choose the number of parcels."),
  weight_kg: numberField()
    .typeError("Total weight must be a number.")
    .moreThan(0, "Total weight must be more than 0 kg.")
    .required("Enter the total weight."),
  goods_description: text(500, "Description of goods").required("Describe the goods."),
  goods_value_gbp: numberField()
    .typeError("Worth of goods must be a number.")
    .min(1, "Worth of goods must be at least £1.")
    .required("Enter the worth of the goods."),
  collection_date: yup
    .string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid collection date.")
    .required("Choose a collection date."),

  // -- Invoicing -----------------------------------------------------------
  rate_per_kg: numberField()
    .typeError("Rate per kg must be a number.")
    .min(0, "Rate per kg cannot be negative.")
    .required("Enter the rate per kg."),
  other_charges: numberField()
    .typeError("Charges must be a number.")
    .min(0, "Charges cannot be negative.")
    .required("Enter the duty, handling and packing charge (0 if none)."),
  total_charges: numberField()
    .typeError("Total charges must be a number.")
    .min(0, "Total charges cannot be negative.")
    .required("Enter the total charges."),

  // -- Sender (UK) ---------------------------------------------------------
  sender_name: text(120, "Sender name").required("Enter the sender's name."),
  sender_phone: yup
    .string()
    .required("Enter the sender's UK mobile.")
    .test("uk-mobile", "Enter a valid UK mobile, e.g. 07700 900123 or +44 7700 900123.", isUkMobile),
  sender_email: optionalText(160, "Sender email").test(
    "email",
    "Enter a valid email address.",
    (v) => !v || yup.string().email().isValidSync(v)
  ),
  sender_address: text(300, "Sender address").required("Enter the sender's address."),
  sender_postcode: yup
    .string()
    .required("Enter the sender's postcode.")
    .test("uk-postcode", "Enter a valid UK postcode, e.g. B10 9AB.", isUkPostcode),
  sender_town: text(120, "Town/city").required("Enter the sender's town or city."),

  // -- Receiver (overseas) -------------------------------------------------
  // receiver_country is 'PK' unless staff flip the "not in Pakistan" toggle,
  // which is what switches both mobile fields from the Pakistan rule to a
  // generic international one.
  receiver_country: yup
    .string()
    .trim()
    .uppercase()
    .matches(/^[A-Z]{2}$/, "Choose the receiver's country.")
    .required("Choose the receiver's country."),
  receiver_name: text(120, "Receiver name").required("Enter the receiver's name."),
  receiver_phone: yup
    .string()
    .required("Enter the receiver's mobile.")
    .when("receiver_country", {
      is: "PK",
      then: (s) =>
        s.test(
          "pk-mobile",
          "Enter a valid Pakistan mobile, e.g. 0300 1234567 or +92 300 1234567.",
          isPkMobile
        ),
      otherwise: (s) =>
        s.test(
          "intl-mobile",
          "Enter the full international number including country code, e.g. +971 50 123 4567.",
          isInternational
        ),
    }),
  receiver_phone_alt: optionalText(32, "Second receiver mobile").when("receiver_country", {
    is: "PK",
    then: (s) =>
      s.test(
        "pk-mobile-alt",
        "Enter a valid Pakistan mobile, e.g. 0300 1234567, or leave blank.",
        (v) => !v || isPkMobile(v)
      ),
    otherwise: (s) =>
      s.test(
        "intl-mobile-alt",
        "Enter the full international number including country code, or leave blank.",
        (v) => !v || isInternational(v)
      ),
  }),
  receiver_email: optionalText(160, "Receiver email").test(
    "email",
    "Enter a valid email address.",
    (v) => !v || yup.string().email().isValidSync(v)
  ),
  receiver_address: text(300, "Receiver address").required("Enter the receiver's address."),
  receiver_city: text(120, "Receiver city/district").required("Enter the receiver's city or district."),
});

// Canonical shape handed to the create_booking RPC. Run this only on values
// that have already passed bookingSchema.
export function toBookingPayload(values) {
  return {
    mode: values.mode,
    parcels: String(values.parcels),
    weight_kg: String(round2(values.weight_kg)),
    goods_description: values.goods_description,
    goods_value_gbp: String(round2(values.goods_value_gbp)),
    collection_date: values.collection_date,

    rate_per_kg: String(round2(values.rate_per_kg)),
    other_charges: String(round2(values.other_charges)),
    total_charges: String(round2(values.total_charges)),

    sender_name: values.sender_name,
    sender_phone: normalizeUkMobile(values.sender_phone),
    sender_email: values.sender_email || "",
    sender_address: values.sender_address,
    sender_postcode: formatPostcode(values.sender_postcode),
    sender_town: values.sender_town,

    receiver_name: values.receiver_name,
    receiver_phone: normalizeReceiverPhone(values.receiver_phone, values.receiver_country),
    receiver_phone_alt: values.receiver_phone_alt
      ? normalizeReceiverPhone(values.receiver_phone_alt, values.receiver_country)
      : "",
    receiver_email: values.receiver_email || "",
    receiver_address: values.receiver_address,
    receiver_city: values.receiver_city,
    receiver_country: values.receiver_country,
  };
}

// yup throws one ValidationError carrying every failure; flatten it to
// { field: message } for rendering next to each input.
export function fieldErrors(error) {
  const out = {};
  for (const inner of error?.inner?.length ? error.inner : [error]) {
    if (inner?.path && !out[inner.path]) out[inner.path] = inner.message;
  }
  return out;
}
