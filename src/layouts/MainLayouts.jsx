import { Outlet } from "react-router-dom";
import SmoothScroll from "@/components/common/SmoothScroll";
import WebGLScene from "@/components/common/WebGLScene";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";

export default function MainLayouts() {
  return (
    <>
      <SmoothScroll />
      <WebGLScene />
      <a className="skip-link" href="#main">Skip to content</a>
      <Header />
      <main id="main">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
