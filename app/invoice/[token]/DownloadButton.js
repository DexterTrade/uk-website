"use client";

export default function DownloadButton() {
  return (
    <button className="btn btn-green" onClick={() => window.print()}>
      Download invoice
    </button>
  );
}
