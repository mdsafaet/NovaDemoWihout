import { useEffect, useState } from "react";
import { ArrowUpRight, Globe2, Menu, X } from "lucide-react";
import { logo } from "@/assets/images";
import { nav } from "@/data/navigation";

export default function Header() {
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // switch to a solid background after the user scrolls a little
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`site-header${scrolled || menu ? " is-solid" : ""}`}>
      <a className="logo" href="#home" aria-label="NOVA Development home">
        <img src={logo} alt="NOVA Development" width="155" height="54" />
      </a>
      <nav className="desktop-nav" aria-label="Main navigation">
        {nav.map(([label, href]) => <a key={href} href={href}>{label}</a>)}
      </nav>
      <div className="header-actions">
        <span className="language"><Globe2 size={16} /> EN</span>
        <a className="header-enquire" href="#contact">Enquire <ArrowUpRight size={16} /></a>
        <button className="menu-toggle" aria-expanded={menu} aria-controls="mobile-menu" aria-label={menu ? "Close menu" : "Open menu"} onClick={() => setMenu(!menu)}>
          {menu ? <X /> : <Menu />}
        </button>
      </div>
      {menu && (
        <nav id="mobile-menu" aria-label="Mobile navigation">
          {nav.map(([label, href]) => (
            <a key={href} href={href} onClick={() => setMenu(false)}>{label}<ArrowUpRight size={18} /></a>
          ))}
          <a href="#contact" onClick={() => setMenu(false)}>Contact us<ArrowUpRight size={18} /></a>
        </nav>
      )}
    </header>
  );
}
