import TextLink from "@/components/common/TextLink";

const principles = [
  ["Design with purpose", "Thoughtful spaces. Meaningful details."],
  ["Rooted in place", "Local understanding. Global perspective."],
  ["Built for tomorrow", "Enduring quality. Long-term stewardship."],
];

const story = {
  title: "A new perspective. A lasting legacy.",
  meta: "OUR STORY · EST. 2009",
  text: "NOVA began in Dhaka in 2009 with a focus on disciplined land development. The group’s corporate story traces its expansion to Dubai in 2016, New York in 2019, and a four-market platform in 2026. The NOVA vision is to create communities that blend premium design, thoughtful investment and a sense of belonging. Design, engineering, governance and stewardship guide that ambition.",
};

export default function Intro({ onOpenDetail }) {
  return (
    <section className="section intro" id="company">
      <div>
        <p className="eyebrow blue">THE NOVA PERSPECTIVE</p>
        <h2>Beyond buildings.<br /><em>Into belonging.</em></h2>
      </div>
      <div className="intro-copy">
        <p className="lead">We believe the most meaningful places are the ones that stay with you.</p>
        <p>NOVA Development creates communities, residences and commercial destinations with a clear purpose: to bring lasting value to the way people live, work and connect.</p>
        <p>From the first vision to the finest detail, we bring together local understanding and a shared global standard.</p>
        <TextLink onClick={() => onOpenDetail(story)}>Discover our story</TextLink>
      </div>
      <div className="principles">
        {principles.map(([title, text], i) => (
          <div key={title}><span>0{i + 1}</span><h3>{title}</h3><p>{text}</p></div>
        ))}
      </div>
    </section>
  );
}
