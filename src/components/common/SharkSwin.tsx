"use client";

import { motion } from "framer-motion";

type SharkSwimProps = {
  width?: number | string; // aceita número (ex: 200) ou string (ex: "50%")
  className?: string; // opcional pra estilizar via Tailwind
  color?: "white" | "black" | string; // 🚨 NOVA PROP: aceita 'white', 'black' ou qualquer string CSS de cor
};

export function SharkSwim({
  width = 200,
  className = "",
  color = "white",
}: SharkSwimProps) {
  // Converte 'black' ou 'white' para as classes Tailwind ou usa a string literal
  const fillColor =
    color === "white" ? "white" : color === "black" ? "black" : color;

  return (
    <div
      className={`relative ${className}`}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        aspectRatio: "325 / 204",
      }}
    >
      <motion.svg
        viewBox="0 0 325 204"
        // 🚨 REMOVEMOS O FILL AQUI, AGORA É NOS PATHS
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        initial={{ y: 0, rotate: 0 }}
        animate={{
          y: [0, -5, 0, 3, 0],
          rotate: [0, 1, 0, -1, 0],
        }}
        transition={{
          duration: 6,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      >
        <motion.g
          animate={{
            rotate: [0, -1, 1, -1, 0],
            x: [0, -2, 0, 2, 0],
          }}
          transition={{
            duration: 5,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M30.3846 113.807L58.3032 111.134L67.2865 97.6841L0 56.988L30.3846 113.807Z"
            fill={fillColor} // 🚨 USA A NOVA PROP AQUI
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M30.388 113.809L53.5508 111.481L64.0313 124.586L12.6857 140.365L30.388 113.809ZM120.221 75.527L180.197 71.9919L93.5868 0L120.221 75.527Z"
            fill={fillColor} // 🚨 USA A NOVA PROP AQUI
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M324.719 63.8862L244.045 67.4213L230.13 112.601L240.963 151.659H253.557L278.922 120.274L271.7 103.117L292.573 103.461L324.719 63.8862ZM30.3846 113.807L120.217 74.5776L229.866 68.0248L221.939 120.964L197.103 151.659L131.842 146.399L30.3846 113.807Z"
            fill={fillColor} // 🚨 USA A NOVA PROP AQUI
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M229.868 68.0239L244.047 67.4204L239.027 203.218L197.105 151.658L229.868 68.0239Z"
            fill={fillColor} // 🚨 USA A NOVA PROP AQUI
          />
        </motion.g>
      </motion.svg>
    </div>
  );
}
