export default function SecurityMesh({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${compact ? "opacity-75" : ""}`} aria-hidden="true">
      <div className="mesh-grid absolute inset-0 opacity-80" />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1200 560" preserveAspectRatio="none">
        <path d="M-40 410 C180 330 250 500 430 356 S760 110 1240 248" fill="none" stroke="var(--accent)" strokeWidth="1.4" opacity=".7" className="mesh-line" />
        <path d="M-30 180 C180 250 310 80 505 206 S840 440 1230 330" fill="none" stroke="var(--primary)" strokeWidth="1.1" opacity=".62" className="mesh-line slow" />
        <path d="M160 560 C240 390 310 295 510 278 S820 290 1040 -20" fill="none" stroke="var(--foreground)" strokeWidth="1" opacity=".22" className="mesh-line" />
        <path d="M80 52 L306 198 L505 206 L718 120 L920 230 L1110 128" fill="none" stroke="var(--foreground)" strokeWidth=".9" opacity=".22" />
        <path d="M120 470 L430 356 L700 430 L920 230 L1100 360" fill="none" stroke="var(--foreground)" strokeWidth=".9" opacity=".2" />
        {[{x:80,y:52},{x:306,y:198},{x:505,y:206},{x:718,y:120},{x:920,y:230},{x:1110,y:128},{x:120,y:470},{x:430,y:356},{x:700,y:430},{x:1100,y:360}].map((point, index) => (
          <g key={`${point.x}-${point.y}`} className={index % 3 === 0 ? "pulse-node delay" : "pulse-node"}>
            <circle cx={point.x} cy={point.y} r="5" fill={index % 3 === 0 ? "var(--primary)" : "var(--accent)"} opacity=".92" />
            <circle cx={point.x} cy={point.y} r="10" fill="none" stroke={index % 3 === 0 ? "var(--primary)" : "var(--accent)"} strokeWidth="1" opacity=".35" />
          </g>
        ))}
      </svg>
    </div>
  );
}
