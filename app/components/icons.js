export function PlaneIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M22 16v-2l-8.5-5V3.5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5V9L2 14v2l8.5-2.5V19L8 20.5V22l4-1 4 1v-1.5L13.5 19v-5.5L22 16z" />
    </svg>
  );
}

export function ShipIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true" {...props}>
      <path d="M3 16.5l1.9 4.1a2 2 0 0 0 1.8 1.15h10.6a2 2 0 0 0 1.8-1.15l1.9-4.1H3z" fill="currentColor" />
      <path d="M5.2 16V9a1 1 0 0 1 1-1h11.6a1 1 0 0 1 1 1v7" stroke="currentColor" strokeWidth="1.6" fill="none" />
      <rect x="8.2" y="4.5" width="3" height="4.2" fill="currentColor" />
      <rect x="12.8" y="4.5" width="3" height="4.2" fill="currentColor" />
    </svg>
  );
}
