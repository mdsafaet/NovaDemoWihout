import { ArrowUpRight } from "lucide-react";

/** Underlined text link with arrow. Renders <a> with `href`, otherwise <button>. Add `light` on dark sections. */
export default function TextLink({ href, light = false, iconSize = 19, className = "", children, ...props }) {
  const cls = `text-link ${light ? "light" : ""} ${className}`.replace(/\s+/g, " ").trim();
  const content = (<>{children} <ArrowUpRight size={iconSize} /></>);
  return href ? (
    <a href={href} className={cls} {...props}>{content}</a>
  ) : (
    <button className={cls} {...props}>{content}</button>
  );
}
