import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import posterNuguNugu from "../../assets/posters/nugu-nugu.jpg";

const POSTER_ASPECT_RATIO = 1280 / 1805;
const POSTER_HEIGHT = 320;
const POSTER_WIDTH = POSTER_HEIGHT * POSTER_ASPECT_RATIO;

const cards = [
  {
    id: 1,
    image: posterNuguNugu,
    name: "누가누구"
  }
];

function useHasHover() {
  const [hasHover, setHasHover] = useState(true);

  useEffect(() => {
    const query = window.matchMedia('(hover: hover) and (pointer: fine)');
    const update = () => setHasHover(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return hasHover;
}

export default function StackedCards() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const hasHover = useHasHover();

  return (
    <div className="relative mx-auto" style={{ width: POSTER_WIDTH, height: POSTER_HEIGHT }}>
      {cards.map((card, index) => (
        <motion.div
          key={card.id}
          className="absolute inset-0 bg-center bg-cover bg-no-repeat cursor-pointer rounded-lg overflow-hidden shadow-lg"
          style={{
            backgroundImage: `url('${card.image}')`,
          }}
          data-name={card.name}
          initial={{ rotate: 0, scale: 1 }}
          animate={{
            rotate: hoveredCard === card.id ? 0 : index * 2 - 4,
            scale: hoveredCard === card.id ? 1.1 : 1,
            zIndex: hoveredCard === card.id ? 50 : index
          }}
          whileHover={hasHover ? {
            scale: 1.1,
            rotate: 0,
            zIndex: 50,
            transition: { duration: 0.3, ease: "easeOut" }
          } : undefined}
          onHoverStart={hasHover ? () => setHoveredCard(card.id) : undefined}
          onHoverEnd={hasHover ? () => setHoveredCard(null) : undefined}
          onClick={!hasHover ? () => setHoveredCard((prev) => (prev === card.id ? null : card.id)) : undefined}
          transition={{
            duration: 0.3,
            ease: "easeOut"
          }}
        >
          {/* Overlay effect on hover */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: hoveredCard === card.id ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          />
          
          {/* Optional: Add a subtle border glow on hover */}
          <motion.div
            className="absolute inset-0 ring-2 ring-white/50 rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: hoveredCard === card.id ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          />
        </motion.div>
      ))}
    </div>
  );
}