import Link from "next/link";

// Copy that has to exist twice — rendered on the page with its links, and as
// plain text in FAQPage schema that must match the page word for word — is
// written once as parts: strings, plus { text, href } for a link.
export function plainText(parts) {
  return parts.map((p) => (typeof p === "string" ? p : p.text)).join("");
}

export default function RichText({ parts }) {
  return parts.map((p, i) =>
    typeof p === "string" ? (
      p
    ) : (
      <Link key={i} href={p.href}>
        {p.text}
      </Link>
    ),
  );
}
