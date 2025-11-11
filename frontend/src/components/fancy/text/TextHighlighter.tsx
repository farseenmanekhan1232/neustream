"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion, useInView } from "motion/react";

import { cn } from "@/lib/utils";

type Direction = "ltr" | "rtl" | "ttb" | "btt";
type TriggerType = "inView" | "hover" | "ref" | "auto";

export const TextHighlighter = forwardRef<
  any,
  {
    children: React.ReactNode;
    as?: keyof JSX.IntrinsicElements;
    triggerType?: TriggerType;
    transition?: any;
    useInViewOptions?: {
      once?: boolean;
      initial?: boolean;
      amount?: number;
    };
    className?: string;
    highlightColor?: string;
    direction?: Direction;
  }
>(
  (
    {
      children,
      as = "span",
      triggerType = "inView",
      transition = { type: "spring", duration: 1, delay: 0, bounce: 0 },
      useInViewOptions = {
        once: true,
        initial: false,
        amount: 0.1,
      },
      className,
      highlightColor = "hsl(25, 90%, 80%)",
      direction = "ltr",
      ...props
    },
    ref,
  ) => {
    const componentRef = useRef(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [currentDirection, setCurrentDirection] = useState(direction);

    // this allows us to change the direction whenever the direction prop changes
    useEffect(() => {
      setCurrentDirection(direction);
    }, [direction]);

    const isInView =
      triggerType === "inView"
        ? useInView(componentRef, useInViewOptions)
        : false;

    useImperativeHandle(ref, () => ({
      animate: (animationDirection) => {
        if (animationDirection) {
          setCurrentDirection(animationDirection);
        }
        setIsAnimating(true);
      },
      reset: () => setIsAnimating(false),
    }));

    const shouldAnimate =
      triggerType === "hover"
        ? isHovered
        : triggerType === "inView"
          ? isInView
          : triggerType === "ref"
            ? isAnimating
            : triggerType === "auto"
              ? true
              : false;

    const ElementTag = as || "span";

    // Get background size based on direction
    const getBackgroundSize = (animated) => {
      switch (currentDirection) {
        case "ltr":
          return animated ? "100% 100%" : "0% 100%";
        case "rtl":
          return animated ? "100% 100%" : "0% 100%";
        case "ttb":
          return animated ? "100% 100%" : "100% 0%";
        case "btt":
          return animated ? "100% 100%" : "100% 0%";
        default:
          return animated ? "100% 100%" : "0% 100%";
      }
    };

    // Get background position based on direction
    const getBackgroundPosition = () => {
      switch (currentDirection) {
        case "ltr":
          return "0% 0%";
        case "rtl":
          return "100% 0%";
        case "ttb":
          return "0% 0%";
        case "btt":
          return "0% 100%";
        default:
          return "0% 0%";
      }
    };

    const animatedSize = useMemo(
      () => getBackgroundSize(shouldAnimate),
      [shouldAnimate, currentDirection],
    );
    const initialSize = useMemo(
      () => getBackgroundSize(false),
      [currentDirection],
    );
    const backgroundPosition = useMemo(
      () => getBackgroundPosition(),
      [currentDirection],
    );

    const highlightStyle = {
      backgroundImage: `linear-gradient(${highlightColor}, ${highlightColor})`,
      backgroundRepeat: "no-repeat",
      backgroundPosition: backgroundPosition,
      backgroundSize: animatedSize,
      boxDecorationBreak: "clone",
      WebkitBoxDecorationBreak: "clone",
    };

    return (
      <ElementTag
        ref={componentRef}
        onMouseEnter={() => triggerType === "hover" && setIsHovered(true)}
        onMouseLeave={() => triggerType === "hover" && setIsHovered(false)}
        {...props}
      >
        <motion.span
          className={cn("inline", className)}
          style={highlightStyle}
          animate={{
            backgroundSize: animatedSize,
          }}
          initial={{
            backgroundSize: initialSize,
          }}
          transition={transition}
        >
          {children}
        </motion.span>
      </ElementTag>
    );
  },
);

TextHighlighter.displayName = "TextHighlighter";

export default TextHighlighter;

// For backward compatibility with the original API
export const TextHighlighterRef = {
  animate: (direction) => {},
  reset: () => {},
};

export const useTextHighlighter = () => {
  const ref = useRef(null);
  return ref;
};
