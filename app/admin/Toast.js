"use client";

// Small confirmation for actions that change something but don't navigate:
// a status change, a bulk update, a rate save. Creating a booking has its own
// modal, because that one produces a reference the user has to act on — these
// only need to say it worked.
//
// aria-live="polite" so it is announced without interrupting, and the whole
// thing is aria-hidden when empty rather than unmounted, so the live region
// exists before the message lands in it.
export default function Toast({ toast, onDismiss }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed right-5 bottom-5 z-50 flex justify-end print:hidden-force"
    >
      {toast && (
        <div
          key={toast.id}
          className={`toast-pop pointer-events-auto flex max-w-[360px] items-start gap-3 rounded-[10px] border bg-white py-[13px] pr-[13px] pl-4 shadow-[0_18px_40px_-20px_rgba(22,35,60,0.45)] ${
            toast.tone === "error" ? "border-red/40" : "border-green/40"
          }`}
        >
          <span
            aria-hidden="true"
            className={`mt-[2px] flex h-[18px] w-[18px] flex-none items-center justify-center rounded-full text-[11px] font-bold text-white ${
              toast.tone === "error" ? "bg-red" : "bg-green"
            }`}
          >
            {toast.tone === "error" ? "!" : "✓"}
          </span>
          <p className="text-[14px] leading-[1.45] text-ink">{toast.message}</p>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={onDismiss}
            className="-mt-[2px] flex h-6 w-6 flex-none items-center justify-center rounded text-[15px] leading-none text-faint hover:text-ink"
          >
            &times;
          </button>
        </div>
      )}
    </div>
  );
}
