import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "./utils";

interface MarqueeImage {
  src?: string;
  title?: string;
  year?: number | string;
  season?: string;
  director?: string;
  tagline?: string;
}

const CATEGORY_BY_SEASON: Record<string, string> = {
  봄: "워크샵공연",
  가을: "워크샵공연",
  여름: "정기공연",
  겨울: "정기공연",
};

interface AnimatedMarqueeHeroProps {
  tagline: string;
  title: React.ReactNode;
  description: React.ReactNode;
  ctaText: string;
  ctaHref: string;
  images: (string | MarqueeImage)[];
  className?: string;
}

const ActionButton = ({ children, href }: { children: React.ReactNode; href: string }) => (
  <motion.a
    href={href}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="mt-10 inline-block px-8 py-3 rounded-full bg-red-500 text-white font-semibold shadow-lg transition-colors hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75"
  >
    {children}
  </motion.a>
);

export const AnimatedMarqueeHero: React.FC<AnimatedMarqueeHeroProps> = ({
  tagline,
  title,
  description,
  ctaText,
  ctaHref,
  images,
  className,
}) => {
  const FADE_IN_ANIMATION_VARIANTS = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } },
  };

  const normalizedImages: MarqueeImage[] = images.map((img) =>
    typeof img === "string" ? { src: img } : img
  );

  const [flippedIndices, setFlippedIndices] = useState<Set<number>>(new Set());

  const toggleFlip = (index: number) => {
    setFlippedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const renderCard = (image: MarqueeImage, index: number) => (
    <div
      key={index}
      className="relative aspect-[3/4] h-60 md:h-80 lg:h-96 xl:h-[30rem] flex-shrink-0 cursor-pointer [perspective:1200px]"
      style={{
        rotate: `${index % 2 === 0 ? -2 : 5}deg`,
      }}
      onClick={() => toggleFlip(index)}
    >
      <motion.div
        className="relative w-full h-full [transform-style:preserve-3d]"
        animate={{ rotateY: flippedIndices.has(index) ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-md [backface-visibility:hidden]">
          {image.src ? (
            <img
              src={image.src}
              alt={image.title ?? `Showcase image ${index + 1}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 border-2 border-dashed border-neutral-300 bg-neutral-100 text-neutral-400 p-3 text-center">
              <span className="text-xs">포스터 준비중</span>
              <span className="text-sm font-semibold text-neutral-500">{image.title}</span>
            </div>
          )}
        </div>

        <div
          className="absolute inset-0 rounded-2xl shadow-md bg-neutral-900 text-white flex flex-col items-center justify-center gap-1 p-3 md:p-4 text-center [backface-visibility:hidden]"
          style={{ transform: "rotateY(180deg)" }}
        >
          <span className="text-[9px] md:text-[10px] uppercase tracking-widest text-neutral-400">
            {image.year} {image.season}
          </span>
          <span className="text-[9px] md:text-[10px] font-medium text-red-400">
            {image.season ? CATEGORY_BY_SEASON[image.season] : undefined}
          </span>
          <span className="text-sm md:text-base font-bold leading-snug mt-1">
            {image.title ?? `#${index + 1}`}
          </span>
          {image.director && (
            <span className="text-[10px] md:text-xs text-neutral-300 mt-1">연출 {image.director}</span>
          )}
          {image.tagline && (
            <span className="text-[9px] md:text-[10px] text-neutral-500 italic mt-1">{image.tagline}</span>
          )}
        </div>
      </motion.div>
    </div>
  );

  return (
    <section
      className={cn(
        "relative w-full overflow-x-hidden bg-gray-50 flex flex-col items-center justify-center text-center px-4 pt-24 pb-4 md:pt-32",
        className
      )}
    >
      <div className="z-10 flex flex-col items-center">
        <motion.div
          initial="hidden"
          animate="show"
          variants={FADE_IN_ANIMATION_VARIANTS}
          className="mb-4 inline-block rounded-full border border-border bg-card/50 px-4 py-1.5 text-sm font-medium text-muted-foreground backdrop-blur-sm"
        >
          {tagline}
        </motion.div>

        <motion.h1
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
          className="text-5xl md:text-7xl font-bold tracking-tighter text-foreground"
        >
          {typeof title === "string" ? (
            title.split(" ").map((word, i) => (
              <motion.span
                key={i}
                variants={FADE_IN_ANIMATION_VARIANTS}
                className="inline-block"
              >
                {word}&nbsp;
              </motion.span>
            ))
          ) : (
            title
          )}
        </motion.h1>

        <motion.p
          initial="hidden"
          animate="show"
          variants={FADE_IN_ANIMATION_VARIANTS}
          transition={{ delay: 0.5 }}
          className="mt-6 max-w-xl text-lg text-muted-foreground whitespace-pre-line"
          style={{ fontFamily: "'JoseonPalace', sans-serif" }}
        >
          {description}
        </motion.p>

        <motion.div
          initial="hidden"
          animate="show"
          variants={FADE_IN_ANIMATION_VARIANTS}
          transition={{ delay: 0.6 }}
        >
          <ActionButton href={ctaHref}>{ctaText}</ActionButton>
        </motion.div>
      </div>

      <div className="relative w-[calc(100%+2rem)] -mx-4 mt-10 pt-4 pb-8 md:pb-12 overflow-x-hidden overflow-y-visible">
        <div className="flex gap-4 w-max marquee-track">
          <div className="flex gap-4 flex-shrink-0">
            {normalizedImages.map((image, index) => renderCard(image, index))}
          </div>
          <div className="flex gap-4 flex-shrink-0">
            {normalizedImages.map((image, index) => renderCard(image, index + normalizedImages.length))}
          </div>
        </div>
      </div>
    </section>
  );
};
