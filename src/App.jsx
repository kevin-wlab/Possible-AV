import { Routes, Route } from "react-router-dom";
import Nav from "./components/Nav.jsx";
import Footer from "./components/Footer.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";

import Home from "./pages/Home.jsx";
import ServicesOverview from "./pages/ServicesOverview.jsx";
import ServiceDetail from "./pages/ServiceDetail.jsx";
import IndustriesOverview from "./pages/IndustriesOverview.jsx";
import IndustryDetail from "./pages/IndustryDetail.jsx";
import Work from "./pages/Work.jsx";
import WorkDetail from "./pages/WorkDetail.jsx";
import About from "./pages/About.jsx";
import Blog from "./pages/Blog.jsx";
import BlogPost from "./pages/BlogPost.jsx";
import Contact from "./pages/Contact.jsx";
import NotFound from "./pages/NotFound.jsx";

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Nav />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<ServicesOverview />} />
          <Route path="/services/:slug" element={<ServiceDetail />} />
          <Route path="/industries" element={<IndustriesOverview />} />
          <Route path="/industries/:slug" element={<IndustryDetail />} />
          <Route path="/work" element={<Work />} />
          <Route path="/work/:slug" element={<WorkDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
