import { ArrowDown } from "lucide-react";
import { project1 } from "@/assets/images";
import Button from "@/components/common/Button";

/**
 * HERO VIDEO SLOT
 * 1. Drop your file in  public/videos/hero.mp4  (keep it muted, ~5–15 MB, H.264).
 * 2. Set  HERO_VIDEO = "/videos/hero.mp4"  below (or pass <Hero videoSrc="..." /> from Home.jsx).
 * Leave it empty to keep the current still image. The image is also used as the poster
 * while the video loads. The WebGL lens/parallax effect runs on the video too.
 */
const HERO_VIDEO = "/videos/hero_co.mp4";

export default function Hero({ videoSrc = HERO_VIDEO, image = project1 }) {
  return (
    <section className="hero" id="home" aria-labelledby="hero-title">
      <img className="hero-image" src={image} alt="Contemporary residence overlooking a tranquil pool" fetchPriority="high" />
      {videoSrc && (
        <video className="hero-video" src={videoSrc} poster={image} autoPlay muted loop playsInline preload="auto" aria-hidden="true" />
      )}
      <div className="hero-shade" />
      <div className="hero-content">
        <p className="eyebrow"><span /> A GLOBAL VISION. A PERSONAL SENSE OF PLACE.</p>
        <h1 id="hero-title">Places for a life<br /><em>well lived.</em></h1>
        <p className="hero-description">Exceptional places. Enduring value.<br />A new perspective on living, from NOVA.</p>
        <Button href="#portfolio" variant="white">Discover our developments</Button>
      </div>
      <div className="hero-bottom">
        <span>LAND · RESIDENCES · COMMERCIAL</span>
        <a href="#company">Explore NOVA <ArrowDown size={16} /></a>
        <span className="hero-index">01 <i /> A world of possibilities</span>
      </div>
    </section>
  );
}
