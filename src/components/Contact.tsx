import { memo } from "react";
import { ExternalLink, ArrowUpRight, FileText } from "lucide-react";
import { LiquidGlassButton } from "./LiquidGlass/LiquidGlass";

const SOCIALS = [
  { label: "X (Twitter)", href: "https://x.com/onkozinternetu" },
  { label: "GitHub", href: "https://github.com/onkofonko" },
];

const preloadPdfModal = () => import("./PdfViewerModal");

interface ContactProps {
  onViewCv: () => void;
}

function Contact({ onViewCv }: ContactProps) {
  return (
    <>
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16 text-center mb-16 md:mb-20">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
          <LiquidGlassButton
            href="mailto:ondrej.michal.ockaj@gmail.com"
            className="px-8 py-4 group/email-btn"
            ariaLabel="Send email"
            magnetic
            tilt
            magneticStrength={0.02}
            specularGlow
          >
            <span className="flex items-center gap-2">
              ondrej.michal.ockaj@gmail.com
              <ArrowUpRight
                size={16}
                className="transition-transform duration-300 group-hover/email-btn:translate-x-0.5 group-hover/email-btn:-translate-y-0.5"
              />
            </span>
          </LiquidGlassButton>
          <span
            onMouseEnter={preloadPdfModal}
            onFocusCapture={preloadPdfModal}
            className="inline-flex"
          >
            <LiquidGlassButton
              onClick={onViewCv}
              className="px-8 py-4 whitespace-nowrap"
              ariaLabel="View CV"
              magnetic
              tilt
              magneticStrength={0.02}
              specularGlow
            >
              View CV
              <FileText
                size={14}
                className="transition-transform duration-200 group-hover:scale-105"
              />
            </LiquidGlassButton>
          </span>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16">
        <div className="w-full h-px bg-stroke/40 mb-6" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Socials */}
          <div className="flex items-center gap-3">
            {SOCIALS.map((social) => (
              <LiquidGlassButton
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs px-4 py-2"
                ariaLabel={`Visit ${social.label}`}
                magnetic
                tilt
                magneticStrength={0.02}
              >
                {social.label}
                <ExternalLink
                  size={12}
                  className="transition-transform duration-200 group-hover:scale-110"
                />
              </LiquidGlassButton>
            ))}
          </div>

          {/* Copyright */}
          <div className="flex items-center gap-4">
            <p
              className="text-xs text-muted text-pretty flex items-center gap-1.5 select-none"
              suppressHydrationWarning
            >
              © {new Date().getFullYear()} Ondrej Michal Očkaj
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default memo(Contact);
