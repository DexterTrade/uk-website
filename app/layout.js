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
    default: `${SITE_NAME} — Direct Cargo to Pakistan & Kashmir`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "A trusted cargo service connecting the UK to Pakistan and Kashmir. Direct cargo by sea and by air, door to door collection, customs clearance and full insurance. Track your shipment online.",
  keywords: [
    "cargo to Pakistan",
    "cargo to Kashmir",
    "UK to Kashmir",
    "direct cargo",
    "door to door cargo",
    "cargo hub",
    "cargo by sea",
    "cargo by air",
    "connect UK to Pakistan",
    "speedy cargo service",
    "trusted cargo service",
    "express cargo service",
    "reliable cargo service",
    "UK to Pakistan shipping",
    "air cargo Pakistan",
    "sea freight Karachi",
    "excess baggage to Pakistan",
    "Pakistan to UK cargo",
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
    title: `${SITE_NAME} — Direct Cargo to Pakistan & Kashmir`,
    description:
      "Direct cargo by sea and by air between the UK and Pakistan, plus excess baggage and a Pakistan-to-UK route, with customs clearance, insurance and online tracking.",
    type: "website",
    url: "/",
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Direct Cargo to Pakistan & Kashmir`,
    description:
      "Direct cargo by sea and by air between the UK and Pakistan, plus excess baggage and a Pakistan-to-UK route, with customs clearance, insurance and online tracking.",
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
