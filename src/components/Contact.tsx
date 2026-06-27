import { memo } from "react";
import { ArrowUpRight } from "lucide-react";
import { LiquidGlassButton } from "./LiquidGlass/LiquidGlass";

const SOCIALS = [
  { label: "GitHub", href: "https://github.com/ockaj" },
  { label: "X (Twitter)", href: "https://x.com/onkozinternetu" },
];

function Contact() {
  return (
    <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16 text-center mb-16 md:mb-20">
      <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-center gap-4 sm:gap-6 max-w-xs sm:max-w-none mx-auto">
        {/* Email button */}
        <LiquidGlassButton
          href="mailto:ondrej.michal.ockaj@gmail.com"
          className="px-8 py-4 whitespace-nowrap group/email-btn"
          ariaLabel="Send email"
          magnetic
          tilt
          magneticStrength={0.02}
          specularGlow
        >
          <span className="flex items-center justify-center gap-2 w-full">
            <span className="sm:hidden">Send email</span>
            <span className="hidden sm:inline">
              ondrej.michal.ockaj@gmail.com
            </span>
            <ArrowUpRight
              aria-hidden="true"
              size={16}
              className="transition-transform duration-300 group-hover/email-btn:translate-x-0.5 group-hover/email-btn:-translate-y-0.5"
            />
          </span>
        </LiquidGlassButton>

        {/* X & GitHub buttons */}
        {SOCIALS.map((social) => (
          <LiquidGlassButton
            key={social.label}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 whitespace-nowrap group/social-btn"
            ariaLabel={`Visit ${social.label}`}
            magnetic
            tilt
            magneticStrength={0.02}
            specularGlow
          >
            <span className="flex items-center justify-center gap-2 w-full">
              {social.label}
              <ArrowUpRight
                aria-hidden="true"
                size={16}
                className="transition-transform duration-300 group-hover/social-btn:translate-x-0.5 group-hover/social-btn:-translate-y-0.5"
              />
            </span>
          </LiquidGlassButton>
        ))}
      </div>
    </div>
  );
}

export default memo(Contact);
