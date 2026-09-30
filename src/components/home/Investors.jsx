import { newsletter } from "@/assets/images";
import Button from "@/components/common/Button";

const points = [
  "Local insight across four markets",
  "Integrated planning and development",
  "A commitment to long-term stewardship",
];

export default function Investors() {
  return (
    <section className="investors section" id="investors">
      <div className="investment-image">
        <img src={newsletter} alt="Light-filled contemporary living space" loading="lazy" />
        <span>THOUGHTFULLY DESIGNED. BUILT TO ENDURE.</span>
      </div>
      <div className="investment-copy">
        <p className="eyebrow blue">PARTNER WITH NOVA</p>
        <h2>A shared vision.<br /><em>A longer view.</em></h2>
        <p>Lasting value begins with the right partnership. We bring market knowledge, development expertise and a disciplined approach to every opportunity.</p>
        <ul>{points.map((p) => <li key={p}>{p}</li>)}</ul>
        <Button href="#contact" variant="blue">Discuss a partnership</Button>
      </div>
    </section>
  );
}
