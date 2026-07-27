import { AnimatedMarqueeHero } from './components/ui/hero-3';
import Footer from './components/Footer';
import posterBeachParasol from '../assets/posters/beach-parasol.png';
import posterLesJustes from '../assets/posters/les-justes.png';
import posterNagibang from '../assets/posters/nagibang.png';
import posterHaeeohwa from '../assets/posters/haeeohwa.png';
import posterSauichanmi from '../assets/posters/sauichanmi.jpg';

const HERO_IMAGES = [
  { src: posterBeachParasol, title: "바다와 양산", year: 2024, season: "여름", director: "이고은" },
  { src: posterLesJustes, title: "정의의 사람들", year: 2024, season: "겨울", director: "이현우" },
  { src: posterNagibang, title: "나를 기억하는 방법", year: 2025, season: "봄", director: "이재은" },
  { src: posterHaeeohwa, title: "해어화", year: 2025, season: "겨울", director: "신혜윤" },
  {
    src: posterSauichanmi,
    title: "사의찬미",
    year: 2026,
    season: "봄",
    director: "김지후",
    tagline: "극회 최고의 연극",
  },
];

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AnimatedMarqueeHero
        tagline="SINCE 1979"
        title={
          <>
            <span className="block text-7xl md:text-9xl" style={{ fontFamily: "'MuseumCulturalFoundationClassic', sans-serif" }}>세종극회</span>
            <span className="block text-2xl md:text-4xl mt-2 font-normal" style={{ fontFamily: "'NanumGothic', sans-serif" }}>Sejong Dramatic Art Group</span>
          </>
        }
        description={
          <>
            {"1973년을 시작으로 매년 공연을 올리고 있다."}
            {"\n"}
            {"그리고 지금 "}
            <span className="font-bold">2026년 여름 정기공연</span>
            {"이 시작된다."}
          </>
        }
        ctaText="Get Started"
        ctaHref="/show.html"
        images={HERO_IMAGES}
      />
      <Footer />
    </div>
  );
}