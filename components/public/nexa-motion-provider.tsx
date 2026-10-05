"use client";

import {MotionConfig} from "motion/react";
import type {ReactNode} from "react";

interface NexaMotionProviderProps {
  children: ReactNode;
}

export const NexaMotionProvider = ({children}: NexaMotionProviderProps) => {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
};
