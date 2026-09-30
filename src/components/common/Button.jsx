import { ArrowUpRight } from "lucide-react";

/** variant: "white" | "blue". Renders <a> when `href` is given, otherwise <button>. */
export default function Button({ href, variant = "white", iconSize = 19, className = "", children, ...props }) {
  const cls = `button button-${variant} ${className}`.trim();
  const content = (<>{children} <ArrowUpRight size={iconSize} /></>);
  return href ? (
    <a href={href} className={cls} {...props}>{content}</a>
  ) : (
    <button className={cls} {...props}>{content}</button>
  );
}
