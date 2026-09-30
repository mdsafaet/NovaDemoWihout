import { useEffect, useState } from "react";
import { glState } from "@/lib/gl-state";
import DetailDialog from "@/components/common/DetailDialog";
import Hero from "@/components/home/Hero";
import MarketStrip from "@/components/home/MarketStrip";
import Intro from "@/components/home/Intro";
import Portfolio from "@/components/home/Portfolio";
import Presence from "@/components/home/Presence";
import Investors from "@/components/home/Investors";
import Responsibility from "@/components/home/Responsibility";
import Journal from "@/components/home/Journal";
import Contact from "@/components/home/Contact";

export default function Home() {
  const [market, setMarket] = useState("Dubai");
  const [detail, setDetail] = useState(null); // shared by Intro / Portfolio / Journal

  // keep the WebGL globe pointing at the selected market
  useEffect(() => { glState.market = market; }, [market]);

  return (
    <>
      <Hero />
      <MarketStrip onSelectMarket={setMarket} />
      <Intro onOpenDetail={setDetail} />
      <Portfolio onOpenDetail={setDetail} />
      <Presence market={market} onMarketChange={setMarket} />
      <Investors />
      <Responsibility />
      <Journal onOpenDetail={setDetail} />
      <Contact />
      <DetailDialog detail={detail} onClose={() => setDetail(null)} />
    </>
  );
}
