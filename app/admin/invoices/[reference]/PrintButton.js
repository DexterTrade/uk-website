"use client";

export default function PrintButton() {
  return (
    <button className="btn btn-green btn-sm" onClick={() => window.print()}>
      Print / save PDF
    </button>
  );
}
