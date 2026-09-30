import { Routes, Route, Navigate } from "react-router-dom";
import MainLayouts from "@/layouts/MainLayouts";
import Home from "@/pages/Home";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayouts />}>
        <Route path="/" element={<Home />} />
        {/* add more pages here, e.g. <Route path="/about" element={<About />} /> */}
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
