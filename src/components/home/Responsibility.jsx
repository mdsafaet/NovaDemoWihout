import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { responsibilityItems } from "@/data/responsibility";

export default function Responsibility() {
  const [open, setOpen] = useState(0);
  return (
    <section className="responsibility section" id="responsibility">
      <div>
        <p className="eyebrow blue">OUR RESPONSIBILITY</p>
        <h2>Good for today.<br /><em>Better for tomorrow.</em></h2>
        <p>Our responsibility extends beyond our developments, to the people and places around them.</p>
      </div>
      <div className="responsibility-list">
        {responsibilityItems.map((item, i) => (
          <div className="responsibility-item" key={item.title}>
            <button aria-expanded={open === i} aria-controls={`responsibility-${i}`} onClick={() => setOpen(open === i ? -1 : i)}>
              <span>0{i + 1}</span>{item.title}{open === i ? <Minus size={20} /> : <Plus size={20} />}
            </button>
            <div id={`responsibility-${i}`} hidden={open !== i}><p>{item.text}</p></div>
          </div>
        ))}
      </div>
    </section>
  );
}
