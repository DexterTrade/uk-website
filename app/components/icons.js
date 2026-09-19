export function PlaneIcon(props) {
  return (
    <svg viewBox="0 0 220 130" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" aria-hidden="true" {...props}>
      {/* tail wing */}
      <polygon points="45,76 65,76 25,95" fill="#01a159" />
      {/* main wing */}
      <polygon points="80,76 120,76 45,110" fill="#01a159" />
      {/* tail fin */}
      <polygon points="52,52 72,52 62,25" fill="#01a159" />
      {/* fuselage */}
      <rect x="40" y="52" width="130" height="24" rx="12" fill="#2e4593" />
      {/* nose */}
      <polygon points="170,52 170,76 195,64" fill="#2e4593" />
      {/* windows */}
      <circle cx="75" cy="62" r="2.6" fill="#fff" />
      <circle cx="90" cy="62" r="2.6" fill="#fff" />
      <circle cx="105" cy="62" r="2.6" fill="#fff" />
      <circle cx="120" cy="62" r="2.6" fill="#fff" />
      <circle cx="135" cy="62" r="2.6" fill="#fff" />
      <circle cx="150" cy="62" r="2.6" fill="#fff" />
      <circle cx="178" cy="64" r="3" fill="#fff" />
    </svg>
  );
}

export function ShipIcon(props) {
  return (
    <svg viewBox="0 0 220 130" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" aria-hidden="true" {...props}>
      {/* water */}
      <path
        d="M0,112 Q11,104 22,112 T44,112 T66,112 T88,112 T110,112 T132,112 T154,112 T176,112 T198,112 T220,112"
        fill="none"
        stroke="#2e4593"
        strokeOpacity="0.3"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M0,120 Q11,113 22,120 T44,120 T66,120 T88,120 T110,120 T132,120 T154,120 T176,120 T198,120 T220,120"
        fill="none"
        stroke="#2e4593"
        strokeOpacity="0.16"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* hull */}
      <polygon points="35,78 195,78 178,104 52,104" fill="#2e4593" />
      <rect x="35" y="74" width="160" height="3" fill="#243874" />
      {/* bridge */}
      <rect x="178" y="58" width="16" height="20" fill="#243874" />
      <rect x="182" y="63" width="4" height="4" fill="#fff" />
      <rect x="189" y="63" width="4" height="4" fill="#fff" />
      {/* containers */}
      <rect x="48" y="48" width="34" height="30" fill="#01a159" />
      <rect x="86" y="42" width="34" height="36" fill="#2e4593" />
      <rect x="124" y="50" width="34" height="28" fill="#01a159" />
      <rect x="162" y="44" width="28" height="34" fill="#2e4593" />
      <line x1="48" y1="63" x2="82" y2="63" stroke="#fff" strokeOpacity="0.3" strokeWidth="2" />
      <line x1="86" y1="60" x2="120" y2="60" stroke="#fff" strokeOpacity="0.3" strokeWidth="2" />
      <line x1="124" y1="64" x2="158" y2="64" stroke="#fff" strokeOpacity="0.3" strokeWidth="2" />
      <line x1="162" y1="61" x2="190" y2="61" stroke="#fff" strokeOpacity="0.3" strokeWidth="2" />
    </svg>
  );
}
