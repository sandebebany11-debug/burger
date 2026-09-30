// The Casa Ducale logo: the gold fleur-de-lis, cut out from the owner's
// artwork (scripts/logo.mjs → public/brand/lilie*.png).
import { site } from "../lib/paths";

type Props = {
  className?: string;
  /** accessible name; empty = decorative */
  title?: string;
  /** rendered width, for choosing the right file */
  sizes?: string;
  priority?: boolean;
};

export default function Emblem({ className = "", title = "Casa Ducale Lilie", sizes = "96px", priority }: Props) {
  return (
    <img
      className={`emblem ${className}`}
      src={site("brand/lilie.png")}
      srcSet={`${site("brand/lilie-small.png")} 130w, ${site("brand/lilie.png")} 520w`}
      sizes={sizes}
      width={520}
      height={640}
      alt={title}
      aria-hidden={title ? undefined : true}
      decoding="async"
      loading={priority ? "eager" : "lazy"}
      draggable={false}
    />
  );
}
