import SectionHeading from "@/components/common/SectionHeading";
import NewsCard from "@/components/common/NewsCard";
import { news } from "@/data/news";

export default function Journal({ onOpenDetail }) {
  const open = (n) => onOpenDetail({ title: n.title, text: n.text, image: n.image, meta: `${n.place} · ${n.date}` });
  return (
    <section className="journal section" id="journal">
      <SectionHeading eyebrow="THE NOVA JOURNAL" title="New perspectives." description="Stories, milestones and the next chapter." />
      <div className="news-grid">
        {news.map((n) => <NewsCard key={n.title} item={n} onOpen={open} />)}
      </div>
    </section>
  );
}
