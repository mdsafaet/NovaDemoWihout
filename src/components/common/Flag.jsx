import { AE, BD, US, GB } from "country-flag-icons/react/3x2";

// Add more countries here: import { FR } from "country-flag-icons/react/3x2" and register below.
const FLAGS = { AE, BD, US, GB };

/** <Flag code="BD" title="Bangladesh" /> — SVG flag from `country-flag-icons`. */
export default function Flag({ code, title, className = "flag" }) {
  const Icon = FLAGS[code];
  return Icon ? <Icon className={className} title={title} aria-hidden={title ? undefined : true} /> : null;
}
