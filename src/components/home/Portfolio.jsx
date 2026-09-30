import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/common/Tabs";
import SectionHeading from "@/components/common/SectionHeading";
import ProjectCard from "@/components/common/ProjectCard";
import TextLink from "@/components/common/TextLink";
import { projects, portfolioFilters } from "@/data/projects";

export default function Portfolio({ onOpenDetail }) {
  const open = (p) => onOpenDetail({ title: p.name, text: p.text, image: p.image, meta: `${p.city} · ${p.type}` });
  return (
    <section className="portfolio section" id="portfolio">
      <SectionHeading
        eyebrow="OUR PORTFOLIO"
        title={<>Distinctive places.<br /><em>Extraordinary possibilities.</em></>}
        description={<>A considered collection of land estates,<br />residences and commercial destinations.</>}
      />
      <Tabs defaultValue="All" className="portfolio-tabs">
        <TabsList className="filter-list" aria-label="Filter developments by market">
          {portfolioFilters.map((t) => (
            <TabsTrigger className="filter" value={t} key={t}>{t === "All" ? "All developments" : t}</TabsTrigger>
          ))}
        </TabsList>
        {portfolioFilters.map((t) => (
          <TabsContent value={t} key={t}>
            <div className="project-grid">
              {projects.filter((p) => t === "All" || p.market === t).map((p) => (
                <ProjectCard key={p.name} project={p} onOpen={open} />
              ))}
            </div>
            {t === "UK" && (
              <div className="empty-market">
                <h3>A new chapter in the United Kingdom.</h3>
                <p>Our UK presence is developing. Speak with our team for the latest project information.</p>
                <TextLink href="#contact" iconSize={18}>Contact the team</TextLink>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
}
