import { ArrowUpRight } from "lucide-react";

export default function NewsCard({ item, onOpen }) {
  return (
    <button className="news-card" onClick={() => onOpen(item)}>
      <div className="news-image">
        <img src={item.image} alt="NOVA architectural inspiration" loading="lazy" />
      </div>
      <p className="eyebrow">{item.place}<span>{item.date}</span></p>
      <h3>{item.title}</h3>
      <span className="text-link">Read story <ArrowUpRight size={18} /></span>
    </button>
  );
}
