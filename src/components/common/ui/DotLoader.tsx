import { motion, type Variants } from "framer-motion";

const loadingContainerVariants = {
  start: {
    transition: {
      staggerChildren: 0.2,
    },
  },
  end: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const loadingDotVariants: Variants = {
  start: { y: "0%" },
  end: {
    y: ["0%", "100%", "0%"],
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: "reverse" as const,
      ease: "easeInOut",
    },
  },
};

interface DotLoaderProps {
  color?: "black" | "white";
}

export function DotLoader({ color = "black" }: DotLoaderProps) {
  return (
    <motion.div
      variants={loadingContainerVariants}
      initial="start"
      animate="end"
      className="flex items-center justify-center space-x-1"
    >
      {[...Array(3)].map((_, i) => (
        <motion.span
          key={i}
          variants={loadingDotVariants}
          className={`block w-2 h-2 rounded-full ${
            color === "black" ? "bg-blackshark-background" : "bg-white"
          }`}
        />
      ))}
    </motion.div>
  );
}
