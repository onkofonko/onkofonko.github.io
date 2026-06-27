import { useCallback, type PointerEvent } from "react";
import { useMotionValue, animate } from "motion/react";
import { springs, ripple as rippleCfg } from "./config";

export function useRipple(enabled: boolean) {
  const rippleX = useMotionValue(0);
  const rippleY = useMotionValue(0);
  const rippleRadius = useMotionValue(0);
  const rippleOpacity = useMotionValue(0);

  const handlePointerDown = useCallback(
    (e: PointerEvent<HTMLElement>) => {
      if (!enabled) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      rippleX.set(x);
      rippleY.set(y);

      const maxRadius =
        Math.max(rect.width, rect.height) * rippleCfg.maxRadiusMultiplier;

      animate(rippleRadius, [0, maxRadius], springs.ripple);

      animate(rippleOpacity, [rippleCfg.initialOpacity, 0], {
        duration: rippleCfg.opacityDuration,
        ease: "easeOut",
      });
    },
    [enabled, rippleX, rippleY, rippleRadius, rippleOpacity],
  );

  return {
    rippleX,
    rippleY,
    rippleRadius,
    rippleOpacity,
    onPointerDown: handlePointerDown,
  };
}
