// The Casa Ducale fleur-de-lis. Every path is a closed outline so it can be
// stroke-drawn (intro) and then filled.
import { useId } from "react";
import { LILY_BAND, LILY_MIRROR as mirror, LILY_PATHS as R, LILY_VIEWBOX } from "../brand/lily";

type Props = {
  className?: string;
  title?: string;
  /** draw with ids/classes the intro animation can target */
  animated?: boolean;
};

export default function Emblem({ className, title = "Casa Ducale Lilie", animated }: Props) {
  const p = animated ? "lily-path" : undefined;
  const gid = `lily-gold-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  return (
    <svg className={className} viewBox={LILY_VIEWBOX} role={title ? "img" : undefined} aria-label={title || undefined} aria-hidden={title ? undefined : true}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--gold-light, #e3c98f)" />
          <stop offset="0.55" stopColor="var(--gold, #b8914f)" />
          <stop offset="1" stopColor="var(--gold-deep, #8a6a34)" />
        </linearGradient>
      </defs>
      <g className="lily" fill={`url(#${gid})`} stroke="var(--gold, #b8914f)" strokeWidth="1.2" strokeLinejoin="round">
        <path className={p} d={R.center} />
        <path className={p} d={R.center} transform={mirror} />
        <path className={p} d={R.petal} />
        <path className={p} d={R.petal} transform={mirror} />
        <path className={p} d={R.foot} />
        <path className={p} d={R.foot} transform={mirror} />
        <path className={p} d={R.stem} />
        <path className={p} d={R.stem} transform={mirror} />
        <rect className={p} {...LILY_BAND} />
        {/* engraved line on the band */}
        <path className={p} d="M78 161 H122" fill="none" strokeWidth="1" stroke="var(--ink, #14110e)" opacity="0.35" />
        {/* centre vein */}
        <path className={p} d="M100 30 V146" fill="none" strokeWidth="0.9" stroke="var(--ink, #14110e)" opacity="0.28" />
      </g>
    </svg>
  );
}
