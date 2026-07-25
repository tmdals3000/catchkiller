import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import imgAlbumcover00024652 from "figma:asset/b37a31598f917a664f0ce74be6cd3ca1ad3b33a3.png";
import img1112 from "figma:asset/cd2816545aef6f7ac4ac2e588a7f2a699ca357a7.png";
import imgLarge440ZFUyPtzh0R1DpPaydmNj1562290428780 from "figma:asset/354f08c9ee4c8b48b2b3139e78ae1409ca8d4f74.png";
import img3 from "figma:asset/8d577a0a4c6260820d35eedc5467eebf83d93437.png";
import imgAlbumcover0017530 from "figma:asset/3cda451e485ee11c5d31b1c4490c1d5c2e3ae030.png";

const cards = [
  {
    id: 1,
    image: imgAlbumcover00024652,
    hoverImage: img1112, // Shows different image on hover
    left: 0,
    name: "albumcover0002465 2",
    artist: "The Thrills",
    album: "So Much For The City"
  },
  {
    id: 2,
    image: img1112,
    hoverImage: imgLarge440ZFUyPtzh0R1DpPaydmNj1562290428780,
    left: 62,
    name: "11 1 2",
    artist: "Unknown Artist",
    album: "Compilation Vol. 11"
  },
  {
    id: 3,
    image: imgLarge440ZFUyPtzh0R1DpPaydmNj1562290428780,
    hoverImage: img3,
    left: 125,
    name: "Jazz Collection",
    artist: "Dave Brubeck",
    album: "Take Five"
  },
  {
    id: 4,
    image: img3,
    hoverImage: imgAlbumcover0017530,
    left: 187,
    name: "Electronic Vibes",
    artist: "Aphex Twin",
    album: "Selected Ambient"
  },
  {
    id: 5,
    image: imgAlbumcover0017530,
    hoverImage: imgAlbumcover00024652,
    left: 249,
    name: "Classic Rock",
    artist: "Led Zeppelin",
    album: "IV"
  }
];

export default function StackedCardsAdvanced() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <div className="relative w-[452px] h-[280px] mx-auto">
      {cards.map((card, index) => (
        <motion.div
          key={card.id}
          className="absolute cursor-pointer rounded-xl overflow-hidden shadow-xl"
          style={{ 
            left: `${card.left}px`,
            top: 0,
            width: 203,
            height: 202
          }}
          initial={{ rotate: 0, scale: 1, y: 0 }}
          animate={{
            rotate: hoveredCard === card.id ? 0 : (index - 2) * 3,
            scale: hoveredCard === card.id ? 1.15 : 1,
            y: hoveredCard === card.id ? -20 : 0,
            zIndex: hoveredCard === card.id ? 50 : index
          }}
          onHoverStart={() => setHoveredCard(card.id)}
          onHoverEnd={() => setHoveredCard(null)}
          transition={{
            duration: 0.4,
            ease: "easeOut"
          }}
        >
          {/* Main image */}
          <motion.div
            className="absolute inset-0 bg-center bg-cover bg-no-repeat"
            style={{ backgroundImage: `url('${card.image}')` }}
            animate={{
              scale: hoveredCard === card.id ? 1.05 : 1
            }}
            transition={{ duration: 0.4 }}
          />

          {/* Hover image overlay */}
          <AnimatePresence>
            {hoveredCard === card.id && (
              <motion.div
                className="absolute inset-0 bg-center bg-cover bg-no-repeat"
                style={{ backgroundImage: `url('${card.hoverImage}')` }}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 0.8, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </AnimatePresence>

          {/* Info overlay */}
          <AnimatePresence>
            {hoveredCard === card.id && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div
                  className="text-white"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <p className="text-sm opacity-90">{card.artist}</p>
                  <p className="font-medium">{card.album}</p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Glow effect */}
          <motion.div
            className="absolute inset-0 ring-2 ring-white/30 rounded-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: hoveredCard === card.id ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          />
        </motion.div>
      ))}
    </div>
  );
}