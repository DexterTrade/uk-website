import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import InvoiceDocument from "@/app/admin/InvoiceDocument";
import DownloadButton from "./DownloadButton";

// Never indexed and never in the sitemap: the link is a secret handed to one
// customer, and a search engine that found one would publish it.
export const metadata = {
  title: "Your invoice",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default async function PublicInvoicePage({ params }) {
  const { token } = await params;
  const supabase = await createClient();

  // The anon key plus a SECURITY DEFINER RPC that takes the token and nothing
  // else — there is no table access here, and nothing to enumerate.
  const { data, error } = await supabase.rpc("get_invoice_by_token", { p_token: token });
  if (error || !data) notFound();

  return (
    <main className="min-h-screen bg-bg-soft pb-16">
      <div className="border-b border-line bg-white print:hidden-force">
        <div className="mx-auto flex max-w-[880px] flex-wrap items-center justify-between gap-4 px-5 py-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.08em] text-faint uppercase">PAK Cargo</p>
            <h1 className="mt-1 font-head text-[20px] font-extrabold text-ink">
              Invoice <span className="text-red">{data.shipment.reference}</span>
            </h1>
          </div>
          <DownloadButton />
        </div>
      </div>

      <div className="mx-auto max-w-[880px] px-5 py-7 max-[560px]:px-0 max-[560px]:py-4">
        <div className="overflow-hidden rounded-xl border border-line bg-white max-[560px]:rounded-none max-[560px]:border-x-0">
          <InvoiceDocument
            shipment={data.shipment}
            customer={data.customer}
            invoice={data.invoice}
            seaEstimate={data.seaEstimate}
            operator=""
          />
        </div>
        <p className="fine mt-5 px-5 text-center print:hidden-force">
          Keep this link private — anyone who has it can view this invoice.
        </p>
      </div>
    </main>
  );
}
