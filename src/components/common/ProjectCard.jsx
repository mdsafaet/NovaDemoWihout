import { ArrowUpRight } from "lucide-react";

export default function ProjectCard({ project, onOpen }) {
  return (
    <button className="project-card" onClick={() => onOpen(project)}>
      <div className="project-image">
        <img src={project.image} alt={project.name} loading="lazy" />
        <span className="project-location">{project.market}</span>
        <span className="project-open"><ArrowUpRight size={22} /></span>
      </div>
      <div className="project-info">
        <p className="eyebrow">{project.type}</p>
        <h3>{project.name}</h3>
        <span>{project.city}</span>
      </div>
    </button>
  );
}
