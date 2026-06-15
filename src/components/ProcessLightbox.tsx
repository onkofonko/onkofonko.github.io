import { useState, useEffect, useRef, memo } from "react";
import { motion, useReducedMotion } from "motion/react";
import { X, Plus, Minus } from "lucide-react";
import LiquidGlass from "./LiquidGlass";
import { useModalHistory } from "../hooks/useModalHistory";

interface ProcessLightboxProps {
  item: {
    id: number;
    title: string;
    description: string;
    image: string;
    type: string;
  };
  onClose: () => void;
}

function ProcessLightbox({ item, onClose }: ProcessLightboxProps) {
  const prefersReducedMotion = useReducedMotion();

  // Close lightbox on back swipe / browser back button
  useModalHistory(true, onClose);

  // Zoom & Pan state
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const dragStart = useRef({ x: 0, y: 0 });
  const dragMoved = useRef(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const [isScaleHovered, setIsScaleHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Multi-touch pinch zoom refs for mobile
  const activePointers = useRef<Map<number, { x: number; y: number }>>(
    new Map(),
  );
  const initialPinchDistance = useRef<number | null>(null);
  const initialPinchScale = useRef<number>(1);
  const initialPinchPosition = useRef<{ x: number; y: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLImageElement>) => {
    activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    e.currentTarget.setPointerCapture(e.pointerId);
    dragMoved.current = false;

    if (activePointers.current.size === 1) {
      if (scale === 1) return;
      setIsDragging(true);
      dragStartPos.current = { x: e.clientX, y: e.clientY };
      dragStart.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      };
    } else if (activePointers.current.size === 2) {
      const points = Array.from(activePointers.current.values());
      const dx = points[0].x - points[1].x;
      const dy = points[0].y - points[1].y;
      initialPinchDistance.current = Math.sqrt(dx * dx + dy * dy);
      initialPinchScale.current = scale;
      initialPinchPosition.current = { x: position.x, y: position.y };
      setIsDragging(false); // Disable panning while pinching
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLImageElement>) => {
    if (activePointers.current.has(e.pointerId)) {
      activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }

    if (activePointers.current.size === 1 && isDragging) {
      const dx = e.clientX - dragStartPos.current.x;
      const dy = e.clientY - dragStartPos.current.y;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
        dragMoved.current = true;
      }

      const newX = e.clientX - dragStart.current.x;
      const newY = e.clientY - dragStart.current.y;
      setPosition({ x: newX, y: newY });
    } else if (
      activePointers.current.size === 2 &&
      initialPinchDistance.current !== null &&
      initialPinchPosition.current !== null
    ) {
      const points = Array.from(activePointers.current.values());
      const dx = points[0].x - points[1].x;
      const dy = points[0].y - points[1].y;
      const currentDistance = Math.sqrt(dx * dx + dy * dy);

      if (initialPinchDistance.current > 0) {
        const factor = currentDistance / initialPinchDistance.current;
        const newScale = Math.max(
          1,
          Math.min(initialPinchScale.current * factor, 4),
        );
        setScale(newScale);

        if (newScale === 1) {
          setPosition({ x: 0, y: 0 });
        } else if (initialPinchScale.current > 1) {
          const pct = (newScale - 1) / (initialPinchScale.current - 1);
          setPosition({
            x: initialPinchPosition.current.x * pct,
            y: initialPinchPosition.current.y * pct,
          });
        }
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLImageElement>) => {
    activePointers.current.delete(e.pointerId);
    e.currentTarget.releasePointerCapture(e.pointerId);

    if (activePointers.current.size < 2) {
      initialPinchDistance.current = null;
      initialPinchPosition.current = null;
    }

    if (activePointers.current.size === 1) {
      const remainingId = Array.from(activePointers.current.keys())[0];
      const remainingPoint = activePointers.current.get(remainingId)!;
      if (scale > 1) {
        setIsDragging(true);
        dragStartPos.current = { x: remainingPoint.x, y: remainingPoint.y };
        dragStart.current = {
          x: remainingPoint.x - position.x,
          y: remainingPoint.y - position.y,
        };
      }
    } else {
      setIsDragging(false);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLImageElement>) => {
    const zoomFactor = 0.15;
    const direction = e.deltaY < 0 ? 1 : -1;
    setScale((prev) => {
      const next = Math.max(1, Math.min(prev + direction * zoomFactor, 4));
      if (next === 1) {
        setPosition({ x: 0, y: 0 });
      } else if (direction < 0 && prev > 1) {
        setPosition((pos) => ({
          x: pos.x * ((next - 1) / (prev - 1)),
          y: pos.y * ((next - 1) / (prev - 1)),
        }));
      }
      return next;
    });
  };

  const handleImageClick = () => {
    if (dragMoved.current) return;

    if (scale === 1) {
      setScale(2.5);
    } else {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  };

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.5, 4));
  };

  const zoomOut = () => {
    setScale((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) {
        setPosition({ x: 0, y: 0 });
      } else {
        setPosition((pos) => ({
          x: pos.x * ((next - 1) / (prev - 1)),
          y: pos.y * ((next - 1) / (prev - 1)),
        }));
      }
      return next;
    });
  };

  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setIsScaleHovered(false);
  };

  // Close lightbox on Escape key press & lock body scroll / touch gestures on mobile
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      document.body.style.overflow = "unset";
    };
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-0 md:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={
        prefersReducedMotion
          ? { duration: 0.15 }
          : { duration: 0.2, ease: "easeOut" }
      }
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="lightbox-title"
        className="relative max-w-7xl w-full h-[100dvh] md:h-auto md:aspect-[16/10] max-h-[100dvh] md:max-h-[85vh] rounded-none md:rounded-2xl overflow-hidden border-0 md:border border-white/10 flex flex-col bg-surface"
        initial={{ scale: prefersReducedMotion ? 1 : 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: prefersReducedMotion ? 1 : 0.96, opacity: 0 }}
        transition={
          prefersReducedMotion
            ? { duration: 0.15 }
            : { type: "spring", damping: 30, stiffness: 350 }
        }
        onClick={(e) => e.stopPropagation()}
      >
        {/* Full Viewport for Diagram (Responsive flex) */}
        <div className="flex-1 md:h-full w-full bg-surface overflow-hidden flex items-center justify-center relative p-4 md:p-6 touch-none">
          <img
            src={item.image}
            alt={item.title}
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              cursor:
                scale > 1 ? (isDragging ? "grabbing" : "grab") : "zoom-in",
              transformOrigin: "center center",
              transition: isDragging ? "none" : "transform 0.15s ease-out",
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onWheel={handleWheel}
            onClick={handleImageClick}
            className="max-w-full max-h-full object-contain select-none pointer-events-auto bg-white rounded-lg md:rounded-xl p-2 md:p-6 shadow-2xl border border-white/5 touch-none"
            draggable={false}
          />
        </div>

        {/* Floating Island Control Panel (Centered on mobile, top-right on desktop) */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-4 z-[60]">
          <div className="inline-flex items-center gap-1.5 bg-surface/80 backdrop-blur-md border border-white/10 p-[6px] rounded-full shadow-2xl select-none">
            {/* Scale / Reset */}
            <span
              onMouseEnter={() => {
                if (scale > 1) setIsScaleHovered(true);
              }}
              onMouseLeave={() => {
                setIsScaleHovered(false);
              }}
              className="flex-shrink-0"
            >
              <LiquidGlass
                as={scale > 1 ? "button" : "span"}
                roundedClass="rounded-full"
                interactive={scale > 1}
                springScale={scale > 1}
                className="h-8 w-16 flex items-center justify-center text-[10px] tracking-wider uppercase select-none font-bold text-text-primary"
                onClick={scale > 1 ? resetZoom : undefined}
                ariaLabel={scale > 1 ? "Reset Zoom" : undefined}
                magnetic={scale > 1}
                magneticStrength={0.04}
              >
                {scale > 1 && (isMobile || isScaleHovered)
                  ? "Reset"
                  : `${Math.round(scale * 100)}%`}
              </LiquidGlass>
            </span>

            {/* Zoom In */}
            <LiquidGlass.Button
              onClick={zoomIn}
              disabled={scale === 4}
              magnetic={true}
              magneticStrength={0.04}
              roundedClass="rounded-full"
              className="size-8 p-0 flex items-center justify-center text-text-primary"
              ariaLabel="Zoom In"
            >
              <Plus size={14} />
            </LiquidGlass.Button>

            {/* Zoom Out */}
            <LiquidGlass.Button
              onClick={zoomOut}
              disabled={scale === 1}
              magnetic={true}
              magneticStrength={0.04}
              roundedClass="rounded-full"
              className="size-8 p-0 flex items-center justify-center text-text-primary"
              ariaLabel="Zoom Out"
            >
              <Minus size={14} />
            </LiquidGlass.Button>

            {/* Separator */}
            <div className="w-px h-4 bg-white/10 mx-0.5" />

            {/* Close */}
            <LiquidGlass.Button
              onClick={onClose}
              ariaLabel="Close lightbox"
              magnetic={true}
              magneticStrength={0.04}
              roundedClass="rounded-full"
              className="size-8 p-0 flex items-center justify-center text-text-primary"
            >
              <X size={14} />
            </LiquidGlass.Button>
          </div>
        </div>

        {/* Bottom text info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/95 via-black/40 to-transparent z-20 pointer-events-none">
          <p
            id="lightbox-title"
            className="text-sm font-medium text-white mb-1 text-balance"
          >
            {item.title}
          </p>
          <p className="text-xs text-white/80 text-pretty">
            {item.description}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default memo(ProcessLightbox);
