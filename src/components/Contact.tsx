import { memo } from 'react';
import { ExternalLink, ArrowUpRight, FileText } from 'lucide-react';
import LiquidGlass from './LiquidGlass';
import BpmnNodeBadge from './BpmnNodeBadge';

const SOCIALS = [
  { label: 'X (Twitter)', href: 'https://x.com/onkozinternetu' },
  { label: 'GitHub', href: 'https://github.com/onkofonko' },
];

const preloadPdfModal = () => import('./PdfViewerModal');

interface ContactProps {
  onViewCv: () => void;
}

function Contact({ onViewCv }: ContactProps) {
  return (
    <footer id="contact" className="bg-transparent pt-16 md:pt-24 pb-8 md:pb-12 overflow-hidden relative scroll-mt-20 md:scroll-mt-24">
      {/* Background video removed — Aurora is global */}

      <div className="relative z-10">

        {/* CTA */}
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16 text-center mb-16 md:mb-20">
          <p className="text-xs text-muted uppercase font-medium mb-5 text-pretty flex items-center justify-center gap-1.5">
            <BpmnNodeBadge type="end-event-none" />
            Get in touch
          </p>
          <h2 className="text-[clamp(2.25rem,5.5vw,4.5rem)] font-display text-text-primary mb-10 leading-[1.1] pb-2 text-balance">
            Let's work together
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <LiquidGlass.Button
              href="mailto:ondrej.michal.ockaj@gmail.com"
              className="px-8 py-4 group/email-btn"
              ariaLabel="Send email"
              magnetic={true}
              tilt={true}
              magneticStrength={0.02}
              specularGlow
            >
              <span className="flex items-center gap-2">
                ondrej.michal.ockaj@gmail.com
                <ArrowUpRight size={16} className="transition-transform duration-300 group-hover/email-btn:translate-x-0.5 group-hover/email-btn:-translate-y-0.5" />
              </span>
            </LiquidGlass.Button>
            <span onMouseEnter={preloadPdfModal} onFocusCapture={preloadPdfModal} className="inline-flex">
              <LiquidGlass.Button
                onClick={onViewCv}
                className="px-6 py-4 whitespace-nowrap"
                ariaLabel="View CV"
                magnetic={true}
                tilt={true}
                magneticStrength={0.02}
                specularGlow
              >
                View CV
                <FileText size={14} className="transition-transform duration-200 group-hover:scale-105" />
              </LiquidGlass.Button>
            </span>
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16">
          <div className="w-full h-px bg-stroke/40 mb-6" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Socials */}
            <div className="flex items-center gap-3">
              {SOCIALS.map(social => (
                <LiquidGlass.Button
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs px-4 py-2"
                  ariaLabel={`Visit ${social.label}`}
                  magnetic={true}
                  tilt={true}
                  magneticStrength={0.02}
                >
                  {social.label}
                  <ExternalLink size={12} className="transition-transform duration-200 group-hover:scale-110" />
                </LiquidGlass.Button>
              ))}
            </div>

            {/* Copyright */}
            <div className="flex items-center gap-4">
              <p className="text-xs text-muted text-pretty flex items-center gap-1.5 select-none">
                © {new Date().getFullYear()} Ondrej Michal Očkaj
              </p>
            </div>


          </div>
        </div>
      </div>
    </footer>
  );
}

export default memo(Contact);
