/** Eyebrow + h2 on the left, short paragraph on the right (Portfolio, Journal). */
export default function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="section-heading">
      <div>
        <p className="eyebrow blue">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      <p>{description}</p>
    </div>
  );
}
