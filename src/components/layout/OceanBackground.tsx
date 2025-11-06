import React, { useMemo, type JSX } from "react";
import { motion } from "framer-motion";

const PARTICLE_COUNT = 40;

export function OceanBackground(): JSX.Element {
  const particles = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }, () => ({
        duration: Math.random() * 10 + 6,
        delay: Math.random() * 6,
        size: Math.random() * 6 + 3,
        yStart: Math.random() * 100, // posição vertical inicial
        opacitySpeed: Math.random() * 6 + 4,
        scale: Math.random() * 0.8 + 0.6,
      })),
    []
  );

  return (
    <div
      aria-hidden
      className="absolute inset-0 overflow-hidden bg-blackshark-background pointer-events-none"
      style={{
        transform: "translateZ(0)",
        position: "absolute",
        inset: 0,
        overflow: "hidden",
      }}
    >
      {particles.map((p, i) => (
        <motion.span
          key={i}
          style={{
            position: "absolute",
            left: "100vw",
            top: `${p.yStart}vh`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: "9999px",
            background: "rgba(59,130,246,0.3)",
            boxShadow: "0 0 12px rgba(59,130,246,0.1)",
            willChange: "transform, opacity",
          }}
          initial={{ x: 0, opacity: 0.4, scale: p.scale }}
          animate={{
            x: ["0vw", "-120vw"],
            opacity: [0.4, 0.9, 0.4],
            scale: [p.scale, p.scale * 1.1, p.scale],
          }}
          transition={{
            x: {
              duration: p.duration,
              repeat: Infinity,
              ease: "linear",
              delay: p.delay,
            },
            opacity: {
              duration: p.opacitySpeed,
              repeat: Infinity,
              ease: "easeInOut",
              repeatType: "reverse" as const,
              delay: p.delay / 2,
            },
            scale: {
              duration: Math.max(2.5, p.duration / 3),
              repeat: Infinity,
              repeatType: "reverse" as const,
              ease: "easeInOut",
              delay: p.delay / 3,
            },
          }}
        />
      ))}
    </div>
  );
}
