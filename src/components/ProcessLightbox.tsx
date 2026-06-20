import { useState, useEffect, useRef, memo } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "motion/react";
import { X, Plus, Minus } from "lucide-react";
import {
  TransformWrapper,
  TransformComponent,
  useControls,
  useTransformEffect,
} from "react-zoom-pan-pinch";
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

// Sub-component for the image to isolate scale updates and cursor states
const ZoomableImage = memo(
  ({
    src,
    alt,
    isZoomed,
    isPanning,
  }: {
    src: string;
    alt: string;
    isZoomed: boolean;
    isPanning: boolean;
  }) => {
    return (
      <img
        src={src}
        alt={alt}
        style={{
          cursor: isZoomed ? (isPanning ? "grabbing" : "grab") : "zoom-in",
        }}
        className={`max-w-full max-h-full object-contain select-none pointer-events-auto bg-white shadow-2xl border border-white/5 touch-none ${
          isZoomed
            ? "p-0 rounded-none border-none"
            : "p-2 md:p-6 rounded-lg md:rounded-xl"
        }`}
        draggable={false}
      />
    );
  },
);

// Sub-component for controls to isolate render cycles from the rest of the lightbox
const LightboxControls = memo(
  ({
    isMobile,
    isZoomed,
    onClose,
  }: {
    isMobile: boolean;
    isZoomed: boolean;
    onClose: () => void;
  }) => {
    const scaleTextRef = useRef<HTMLSpanElement>(null);
    const { zoomIn, zoomOut, resetTransform } = useControls();

    useTransformEffect(({ state }) => {
      const scaleVal = state.scale;
      // Update text directly in the DOM to avoid triggering React re-renders of the buttons
      if (scaleTextRef.current) {
        scaleTextRef.current.innerText =
          scaleVal > 1.01 && isMobile
            ? "Reset"
            : `${Math.round(scaleVal * 100)}%`;
      }
    });

    return (
      <div className="absolute top-4 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-4 z-[60]">
        <div className="inline-flex items-center gap-1.5 bg-surface/80 backdrop-blur-md border border-white/10 p-[6px] rounded-full shadow-2xl select-none">
          {/* Scale / Reset */}
          <LiquidGlass
            as={isZoomed ? "button" : "span"}
            roundedClass="rounded-full"
            interactive={isZoomed}
            springScale={isZoomed}
            className={`h-8 w-16 flex items-center justify-center text-[10px] tracking-wider uppercase select-none font-bold text-text-primary ${
              isZoomed
                ? "pointer-events-auto cursor-pointer"
                : "pointer-events-none cursor-default"
            }`}
            onClick={isZoomed ? () => resetTransform() : undefined}
            magnetic={isZoomed}
            magneticStrength={0.04}
          >
            <span ref={scaleTextRef}>100%</span>
          </LiquidGlass>

          {/* Zoom In */}
          <LiquidGlass.Button
            onClick={() => zoomIn(0.15, 0)}
            disabled={false}
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
            onClick={() => zoomOut(0.15, 0)}
            disabled={!isZoomed}
            magnetic={isZoomed}
            magneticStrength={0.04}
            roundedClass="rounded-full"
            className="size-8 p-0 flex items-center justify-center text-text-primary disabled:opacity-40 disabled:pointer-events-none"
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
    );
  },
);

function ProcessLightbox({ item, onClose }: ProcessLightboxProps) {
  const prefersReducedMotion = useReducedMotion();

  // Close lightbox on back swipe / browser back button
  useModalHistory(true, onClose);

  const [isMobile, setIsMobile] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isPanning, setIsPanning] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close lightbox on Escape key press & lock body scroll on mobile
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [onClose]);

  if (typeof document === "undefined") return null;

  const cursorStyle = isZoomed ? (isPanning ? "grabbing" : "grab") : "zoom-in";

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-0 md:p-6 touch-none"
      style={{ touchAction: "none" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={
        prefersReducedMotion
          ? { duration: 0.15 }
          : { duration: isMobile ? 0.45 : 0.2, ease: "easeOut" }
      }
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="lightbox-title"
        className="relative max-w-7xl w-full h-[100dvh] md:h-auto md:aspect-[16/10] max-h-[100dvh] md:max-h-[85vh] rounded-none md:rounded-3xl overflow-hidden border-0 md:border border-white/10 flex flex-col bg-surface"
        initial={{
          scale: prefersReducedMotion ? 1 : isMobile ? 0.92 : 0.96,
          opacity: 0,
        }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{
          scale: prefersReducedMotion ? 1 : isMobile ? 0.92 : 0.96,
          opacity: 0,
        }}
        transition={
          prefersReducedMotion
            ? { duration: 0.15 }
            : isMobile
              ? { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }
              : { type: "spring", damping: 30, stiffness: 350 }
        }
        onClick={(e) => e.stopPropagation()}
      >
        {/* Full Viewport for Diagram (Responsive flex) */}
        <div
          className={`flex-1 md:h-full w-full bg-surface overflow-hidden flex items-center justify-center relative touch-none ${
            isZoomed ? "p-0" : "p-4 md:p-6"
          }`}
        >
          <TransformWrapper
            initialScale={1}
            minScale={1}
            maxScale={6}
            centerOnInit
            centerZoomedOut
            smooth={true}
            disablePadding={true}
            doubleClick={{ mode: "toggle", animationTime: 0 }}
            wheel={{ step: 0.00125 }}
            zoomAnimation={{ disabled: true }}
            onTransform={(_ref, state) => {
              const zoomed = state.scale > 1.01;
              if (zoomed !== isZoomed) {
                setIsZoomed(zoomed);
              }
            }}
            onPanningStart={() => setIsPanning(true)}
            onPanningStop={() => setIsPanning(false)}
          >
            {/* Floating Island Control Panel inside context to use useControls */}
            <LightboxControls
              isMobile={isMobile}
              isZoomed={isZoomed}
              onClose={onClose}
            />

            <TransformComponent
              wrapperStyle={{
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                cursor: cursorStyle,
              }}
              contentStyle={{
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                cursor: cursorStyle,
              }}
            >
              <ZoomableImage
                src={item.image}
                alt={item.title}
                isZoomed={isZoomed}
                isPanning={isPanning}
              />
            </TransformComponent>
          </TransformWrapper>
        </div>

        {/* Bottom text info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/95 via-black/40 to-transparent z-20 pointer-events-none">
          <p
            id="lightbox-title"
            className="text-sm font-semibold text-white mb-1 text-balance"
          >
            {item.title}
          </p>
          <p className="text-xs text-white/80 text-pretty">
            {item.description}
          </p>
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  );
}

export default memo(ProcessLightbox);
