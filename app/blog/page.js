import Image from "next/image";
import Link from "next/link";
import AnnouncementBar from "../components/AnnouncementBar";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import WhatsAppFloat from "../components/WhatsAppFloat";
import JsonLd from "../components/JsonLd";
import { POSTS, hasPublishedPosts } from "@/lib/blog";
import { breadcrumbs } from "@/lib/schema";
import { SHOW_DRAFTS, pageMeta } from "@/lib/seo";
import { formatPostDate } from "./format";

const PATH = "/blog";

// An empty listing is thin content, so /blog stays noindex (and out of the
// sitemap and navigation) until the first post is published.
export const metadata = pageMeta({
  title: "Cargo to Pakistan Guides & Tips | PAK Cargo Blog",
  description:
    "Guides on sending cargo to Pakistan from the UK: transit times, costs, customs duties and what you can send. Read our tips, then get your free quote.",
  path: PATH,
  noindex: !hasPublishedPosts(),
});

export default function BlogPage() {
  const posts = POSTS.filter((p) => p.published || SHOW_DRAFTS).sort((a, b) =>
    String(b.datePublished).localeCompare(String(a.datePublished)),
  );

  return (
    <>
      <JsonLd data={breadcrumbs([{ name: "Blog", path: PATH }])} />
      <SiteHeader variant="service" announcement={<AnnouncementBar />} />
      <main className="section wrap pt-14">
        <span className="eyebrow">Blog</span>
        <h1 className="mt-[18px] text-[clamp(30px,4vw,42px)] font-extrabold">Cargo to Pakistan Guides &amp; Tips</h1>
        <p className="lede">
          Practical guides on sending cargo from the UK to Pakistan: transit times, costs, customs duties and what you
          can send.
        </p>
        {posts.length === 0 ? (
          <p className="lede mt-10">
            Our first guides are on their way. In the meantime, <Link href="/faq">our FAQ</Link> answers the most
            common questions.
          </p>
        ) : (
          <div className="mt-10 grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6">
            {posts.map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="block overflow-hidden rounded-xl border border-line bg-white text-ink hover:border-green"
              >
                <div className="relative [aspect-ratio:16/9]">
                  <Image src={p.image} alt={p.imageAlt} fill sizes="(max-width: 700px) 100vw, 380px" className="object-cover" />
                </div>
                <div className="p-5">
                  {!p.published && <span className="badge mb-2">Draft</span>}
                  <h2 className="text-lg font-bold">{p.h1}</h2>
                  {p.datePublished && <p className="fine mt-2">{formatPostDate(p.datePublished)}</p>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
      <WhatsAppFloat />
    </>
  );
}
