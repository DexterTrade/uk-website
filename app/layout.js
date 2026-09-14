import { Archivo, IBM_Plex_Sans } from "next/font/google";
import { SITE_NAME, SITE_URL } from "@/lib/seo";
import OrganizationJsonLd from "./components/OrganizationJsonLd";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Air & Sea Freight from the UK to Pakistan`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "PAK Cargo ships air and sea freight from the UK to Pakistan. Door-to-door collection, customs clearance and full insurance. Track your shipment and view invoices online.",
  keywords: [
    "cargo to Pakistan",
    "UK to Pakistan shipping",
    "air cargo Pakistan",
    "sea freight Karachi",
    "cargo tracking",
    "customs clearance",
    "freight forwarder UK Pakistan",
    "parcel to Pakistan from UK",
  ],
  alternates: {
    canonical: "/",
  },
  authors: [{ name: SITE_NAME }],
  applicationName: SITE_NAME,
  formatDetection: { telephone: true, email: true, address: true },
  openGraph: {
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Air & Sea Freight, UK to Pakistan`,
    description:
      "Air and sea freight from the UK to Pakistan with customs clearance, insurance and online tracking.",
    type: "website",
    url: "/",
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Air & Sea Freight, UK to Pakistan`,
    description:
      "Air and sea freight from the UK to Pakistan with customs clearance, insurance and online tracking.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport = {
  themeColor: "#01a159",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-GB" className={`${archivo.variable} ${plexSans.variable}`}>
      <body>
        <OrganizationJsonLd />
        {children}
      </body>
    </html>
  );
}
