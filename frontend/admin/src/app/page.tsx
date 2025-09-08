import Navbar from "./landing/Navbar";
import Hero from "./landing/Hero";
import Slider from "./landing/Slider";
import Features from "@/app/landing/Features";
import About from "./landing/About";
import Footer from "./landing/Footer";
// Remove unused import since Swiper and SwiperSlide are not used in this file
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";


export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Slider />
      <Features />
      <About />
      <Footer />
    </main>
  );
}
