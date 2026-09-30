import { ArrowUpRight } from "lucide-react";
import { logo } from "@/assets/images";
import { footerNav } from "@/data/navigation";

export default function Footer() {
  return (
    <footer>
      <div className="footer-main">
        <a href="#home" className="logo" aria-label="Back to NOVA home">
          <img src={logo} alt="NOVA Development" width="155" height="54" />
        </a>
        <p>Places of possibility.<br />A legacy of belonging.</p>
        <nav aria-label="Footer navigation">
          {footerNav.map(([label, href]) => <a key={href} href={href}>{label}</a>)}
        </nav>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} NOVA Development</span>
        <span>DUBAI · DHAKA · NEW YORK · LONDON</span>
        <a href="#home">Back to top <ArrowUpRight size={15} /></a>
      </div>
    </footer>
  );
}
