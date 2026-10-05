"use client";

import {motion} from "motion/react";
import type {ReactNode} from "react";

interface MotionRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export const MotionReveal = ({
  children,
  className,
  delay = 0,
}: MotionRevealProps) => {
  return (
    <motion.div
      className={className}
      initial={{opacity: 0, y: 24}}
      whileInView={{opacity: 1, y: 0}}
      viewport={{once: true, amount: 0.15}}
      transition={{duration: 0.55, delay, ease: "easeOut"}}
    >
      {children}
    </motion.div>
  );
};
