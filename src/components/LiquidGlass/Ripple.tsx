import { memo } from "react";
import { motion, type MotionValue } from "motion/react";

interface RippleProps {
  rippleX: MotionValue<number>;
  rippleY: MotionValue<number>;
  rippleRadius: MotionValue<number>;
  rippleOpacity: MotionValue<number>;
}

// memoize Ripple to prevent unnecessary virtual DOM reconstruction when parent scale/dimensions re-render
function Ripple({
  rippleX,
  rippleY,
  rippleRadius,
  rippleOpacity,
}: RippleProps) {
  return (
    <motion.span
      className="absolute pointer-events-none z-10 rounded-full bg-white blur-[6px] mix-blend-screen"
      style={{
        left: rippleX,
        top: rippleY,
        width: rippleRadius,
        height: rippleRadius,
        x: "-50%",
        y: "-50%",
        opacity: rippleOpacity,
      }}
    />
  );
}

Ripple.displayName = "Ripple";

export default memo(Ripple);
export type { RippleProps };
