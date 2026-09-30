import { ArrowUpRight, Globe2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/common/Tabs";
import TextLink from "@/components/common/TextLink";
import { markets } from "@/data/markets";

export default function Presence({ market, onMarketChange }) {
  return (
    <section className="presence section" id="presence">
      <div className="presence-intro">
        <p className="eyebrow">CONNECTED BY AMBITION</p>
        <h2>Global reach.<br /><em>Local understanding.</em></h2>
        <p>Different cities. Distinct opportunities.<br />One commitment to places of lasting value.</p>
        {/* The WebGL globe is drawn over this slot (see WebGLScene) */}
        <div className="presence-globe-slot" data-gl="globe" aria-hidden="true">
          <Globe2 className="presence-globe" strokeWidth={0.6} />
        </div>
      </div>
      <div className="market-details">
        <Tabs value={market} onValueChange={onMarketChange}>
          <TabsList className="city-tabs" aria-label="Explore our markets">
            {markets.map((m, i) => (
              <TabsTrigger key={m.name} className="city-tab" value={m.name}><small>0{i + 1}</small>{m.name}</TabsTrigger>
            ))}
          </TabsList>
          {markets.map((m) => (
            <TabsContent value={m.name} key={m.name} className="city-panel">
              <div className="city-heading">
                <span className="eyebrow">{m.country}</span>
                <span className="status">{m.status}</span>
              </div>
              <h3>{m.name}<ArrowUpRight strokeWidth={1} /></h3>
              <p>{m.text}</p>
              <div className="city-address">
                <span className="eyebrow">CORPORATE OFFICE</span>
                <p>{m.address}</p>
              </div>
              <TextLink href="#contact" light iconSize={18}>Connect with our team</TextLink>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
