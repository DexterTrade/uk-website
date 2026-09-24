import { Archivo, Gulzar, IBM_Plex_Sans } from "next/font/google";
import Script from "next/script";
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

// Urdu script: the Latin fonts above carry no Urdu glyphs, so without this the
// browser falls back to whatever Arabic face the visitor's OS happens to have.
// Gulzar is Nastaliq — the calligraphic style Urdu readers expect — but drawn
// for screen text, so it stays legible where Noto Nastaliq reads as cramped.
const nastaliq = Gulzar({
  variable: "--font-urdu-nastaliq",
  subsets: ["arabic"],
  weight: "400",
});

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Door to Door Cargo to Pakistan & Kashmir`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "A trusted cargo service connecting the UK to Pakistan and Kashmir. Door to door cargo by sea and by air, customs clearance and full insurance. Track your shipment online.",
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
    title: `${SITE_NAME} — Door to Door Cargo to Pakistan & Kashmir`,
    description:
      "Door to door cargo by sea and by air between the UK and Pakistan, plus excess baggage and a Pakistan-to-UK route, with customs clearance, insurance and online tracking.",
    type: "website",
    url: "/",
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Door to Door Cargo to Pakistan & Kashmir`,
    description:
      "Door to door cargo by sea and by air between the UK and Pakistan, plus excess baggage and a Pakistan-to-UK route, with customs clearance, insurance and online tracking.",
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
    <html
      lang="en-GB"
      className={`${archivo.variable} ${plexSans.variable} ${nastaliq.variable} overflow-x-hidden`}
    >
      <body className="m-0 overflow-x-hidden bg-white font-body text-ink antialiased">
        {/* Google tag (gtag.js) for Google Ads */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=AW-18462573024"
          strategy="afterInteractive"
        />
        <Script id="google-ads-gtag" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-18462573024');
          `}
        </Script>
        {/* Meta Pixel */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '2330472387806980');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=2330472387806980&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        <OrganizationJsonLd />
        {children}
      </body>
    </html>
  );
}
