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
      <div className="flex flex-col sm:flex-row sm:flex-wrap items-center justify-center gap-4 sm:gap-6 mx-auto">
        {/* Email button wrapper */}
        <div className="w-full sm:w-auto flex justify-center">
          <LiquidGlassButton
            href="mailto:ondrej.michal.ockaj@gmail.com"
            className="px-6 py-3 sm:px-8 sm:py-4 whitespace-nowrap group/email-btn w-fit"
            ariaLabel="Send email"
            magnetic
            tilt
            magneticStrength={0.02}
            specularGlow
          >
            <span className="flex items-center justify-center gap-2 w-full">
              <span>ondrej.michal.ockaj@gmail.com</span>
              <ArrowUpRight
                aria-hidden="true"
                size={16}
                className="transition-transform duration-300 group-hover/email-btn:translate-x-0.5 group-hover/email-btn:-translate-y-0.5"
              />
            </span>
          </LiquidGlassButton>
        </div>

        {/* Social buttons wrapper */}
        <div className="flex flex-row justify-center gap-3 w-full sm:w-auto sm:gap-6">
          {SOCIALS.map((social) => (
            <LiquidGlassButton
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3 sm:px-8 sm:py-4 text-xs sm:text-sm whitespace-nowrap group/social-btn flex-1 sm:flex-initial max-w-[145px] sm:max-w-none"
              ariaLabel={`Visit ${social.label}`}
              magnetic
              tilt
              magneticStrength={0.02}
              specularGlow
            >
              <span className="flex items-center justify-center gap-1.5 sm:gap-2 w-full">
                {social.label}
                <ArrowUpRight
                  aria-hidden="true"
                  size={13}
                  className="sm:hidden transition-transform duration-300 group-hover/social-btn:translate-x-0.5 group-hover/social-btn:-translate-y-0.5"
                />
                <ArrowUpRight
                  aria-hidden="true"
                  size={16}
                  className="hidden sm:inline transition-transform duration-300 group-hover/social-btn:translate-x-0.5 group-hover/social-btn:-translate-y-0.5"
                />
              </span>
            </LiquidGlassButton>
          ))}
        </div>
      </div>
    </div>
  );
}

export default memo(Contact);
