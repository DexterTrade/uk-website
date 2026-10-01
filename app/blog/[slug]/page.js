import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import AnnouncementBar from "../../components/AnnouncementBar";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import WhatsAppFloat from "../../components/WhatsAppFloat";
import JsonLd from "../../components/JsonLd";
import { BODIES } from "../posts";
import { formatPostDate } from "../format";
import { postBySlug } from "@/lib/blog";
import { blogPosting, breadcrumbs } from "@/lib/schema";
import { serviceByHref } from "@/lib/services";
import { BUSINESS, SHOW_DRAFTS, pageMeta } from "@/lib/seo";

// A draft is a 404 unless drafts are being previewed with SHOW_DRAFTS.
function visiblePost(slug) {
  const post = postBySlug(slug);
  if (!post || (!post.published && !SHOW_DRAFTS)) return null;
  return post;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = visiblePost(slug);
  if (!post) return {};
  return pageMeta({
    title: post.title,
    description: post.description,
    path: `/blog/${post.slug}`,
    noindex: !post.published,
    type: "article",
    image: { url: post.image, alt: post.imageAlt },
  });
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = visiblePost(slug);
  if (!post) notFound();

  const path = `/blog/${post.slug}`;
  const Body = BODIES[post.slug];
  const services = post.related.map(serviceByHref).filter(Boolean);

  return (
    <>
      {post.published && (
        <JsonLd
          data={blogPosting({
            path,
            headline: post.h1,
            datePublished: post.datePublished,
            dateModified: post.dateModified,
            author: post.author,
            image: post.image,
          })}
        />
      )}
      <JsonLd
        data={breadcrumbs([
          { name: "Blog", path: "/blog" },
          { name: post.h1, path },
        ])}
      />
      <SiteHeader variant="service" announcement={<AnnouncementBar />} />
      <main className="wrap-narrow px-5 pt-12 pb-16">
        <article className="mx-auto max-w-[760px]">
          <Link href="/blog" className="fine">
            &larr; All guides
          </Link>
          <h1 className="mt-4 text-[clamp(28px,4vw,40px)] leading-[1.15] font-extrabold">{post.h1}</h1>
          <p className="fine mt-3">
            By {post.author}
            {post.datePublished && <> &middot; Published {formatPostDate(post.datePublished)}</>}
            {post.dateModified && post.dateModified !== post.datePublished && (
              <> &middot; Updated {formatPostDate(post.dateModified)}</>
            )}
          </p>
          {/* The top image is the post's largest paint, so it is fetched
              eagerly rather than lazy-loaded. */}
          <div className="relative mt-6 overflow-hidden rounded-xl [aspect-ratio:16/9]">
            <Image
              src={post.image}
              alt={post.imageAlt}
              fill
              sizes="(max-width: 800px) 100vw, 760px"
              loading="eager"
              fetchPriority="high"
              className="object-cover"
            />
          </div>

          <div className="mt-8 text-[16.5px] leading-[1.75] text-muted">
            {Body ? (
              <Body />
            ) : (
              <p className="rounded bg-amber-soft p-4 text-amber-ink">[Draft: article body awaiting approved copy]</p>
            )}
          </div>

          <aside className="mt-12 rounded-xl bg-ink p-7 text-[#b9c3d6]" data-location="blog-cta">
            <p className="font-head text-xl font-extrabold text-white">Ready to send cargo to Pakistan?</p>
            <p className="mt-2">
              Tell us what you&rsquo;re sending and where it&rsquo;s going &mdash; we reply the same working day with a
              fixed price.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link className="btn btn-green" href="/contact-us">
                Get a quote
              </Link>
              <a className="btn btn-ghost" href={BUSINESS.whatsapp}>
                WhatsApp us
              </a>
            </div>
          </aside>

          {services.length > 0 && (
            <section className="mt-12">
              <h2 className="text-[22px] font-extrabold">Related services</h2>
              <div className="cards mt-5">
                {services.map((s) => (
                  <Link key={s.href} href={s.href} className="svc block text-ink">
                    <h3>{s.name}</h3>
                    <p>{s.blurb}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </article>
      </main>
      <SiteFooter />
      <WhatsAppFloat />
    </>
  );
}
