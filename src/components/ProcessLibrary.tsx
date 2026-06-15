import { useState, useCallback, memo } from 'react';
import { motion, AnimatePresence, Variants } from 'motion/react';
import { PROCESS_ITEMS } from '../data/processItems';
import LiquidGlass from './LiquidGlass';
import BpmnNodeBadge from './BpmnNodeBadge';
import ProcessLightbox from './ProcessLightbox';


const tabContentVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 15,
    scale: 0.98,
    transition: { duration: 0.15, ease: [0.25, 0.1, 0.25, 1] as const }
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.25, ease: [0.23, 1, 0.32, 1] as const }
  },
  exit: {
    opacity: 0,
    y: -15,
    scale: 0.98,
    transition: { duration: 0.15, ease: [0.25, 0.1, 0.25, 1] as const }
  }
};

function ProcessLibrary() {
  const [activeItem, setActiveItem] = useState(PROCESS_ITEMS[0]);
  const [lightboxItem, setLightboxItem] = useState<typeof PROCESS_ITEMS[0] | null>(null);

  const handleTabChange = useCallback((id: number) => {
    const selected = PROCESS_ITEMS.find(item => item.id === id);
    if (selected) {
      setActiveItem(selected);
    }
  }, []);



  return (
    <>
      <section id="processes" className="bg-transparent pt-16 md:pt-24 pb-0 scroll-mt-20 md:scroll-mt-24">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16">
          {/* Header */}
          <div className="mb-10 md:mb-14 relative z-30">
            <h2 className="text-3xl md:text-5xl font-display text-text-primary mb-3 text-balance flex items-center gap-3">
              <BpmnNodeBadge type="subprocess-collapsed" className="translate-y-[2px]" />
              BPMN & Process models
            </h2>
            <p className="text-sm text-muted max-w-sm text-pretty">
              Real-world enterprise process diagrams, workflows, and transformation models.
            </p>
          </div>

          {/* Interactive Split Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-stretch relative z-20">
            
            {/* Left Column: Index Menu Selector */}
            <LiquidGlass.Tabs
              value={activeItem.id}
              onChange={handleTabChange}
              layoutId="active-process-highlight"
              roundedClass="rounded-xl"
              className="lg:col-span-5 flex flex-col gap-2 justify-center"
            >
              {PROCESS_ITEMS.map((item, idx) => (
                <LiquidGlass.Tab
                  key={item.id}
                  value={item.id}
                  className={`w-full text-left relative px-5 py-4 rounded-xl transition-colors duration-300 flex items-center gap-4 select-none cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
                    activeItem.id === item.id ? 'text-text-primary' : 'text-muted hover:text-text-primary'
                  }`}
                >
                  {/* Badge Index */}
                  <span className="relative z-10 text-xs font-body font-semibold text-accent/80 tabular-nums min-w-[20px]">
                    {String(idx + 1).padStart(2, '0')}
                  </span>

                  {/* Metadata */}
                  <div className="relative z-10">
                    <h4 className="text-sm font-semibold transition-transform duration-300 group-hover:translate-x-1 text-balance">
                      {item.title}
                    </h4>
                    <p className="text-[9px] text-muted uppercase mt-0.5">
                      {item.type}
                    </p>
                  </div>
                </LiquidGlass.Tab>
              ))}
            </LiquidGlass.Tabs>

            {/* Right Column: Visual Preview Canvas */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeItem.id}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={tabContentVariants}
                  className="w-full h-full flex flex-col"
                >
                  <LiquidGlass
                    as="div"
                    roundedClass="rounded-2xl"
                    className="w-full h-full p-6 md:p-8 flex-col text-left justify-start items-stretch"
                    tilt={true}
                  >
                    {/* Canvas Header */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6 relative z-10 w-full">
                      <div>
                        <span className="inline-block text-[9px] text-accent uppercase bg-accent/10 border border-accent/20 rounded px-2.5 py-0.5">
                          {activeItem.type}
                        </span>
                        <h3 className="text-xl md:text-2xl font-display text-text-primary mt-2 text-balance">
                          {activeItem.title}
                        </h3>
                      </div>
                    </div>

                    {/* Adaptable Grid Canvas Board */}
                    <button
                      type="button"
                      className="relative w-full aspect-[16/10] rounded-xl overflow-hidden border border-stroke/50 flex items-center justify-center p-0 mb-6 select-none cursor-zoom-in group/canvas z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                      onClick={() => setLightboxItem(activeItem)}
                      aria-label={`Zoom diagram: ${activeItem.title}`}
                      style={{
                        background: `radial-gradient(circle, hsl(var(--stroke)) 1px, transparent 1px) 0 0 / 16px 16px, hsl(var(--surface))`,
                        boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.4)',
                      }}
                    >
                      <img
                        src={activeItem.image}
                        alt={activeItem.title}
                        width={800}
                        height={500}
                        className="w-full h-full object-contain rounded-lg p-6 transition-transform duration-500 group-hover/canvas:scale-102"
                        loading="lazy"
                      />

                      {/* Zoom badge overlay */}
                      <div className="absolute bottom-3 right-3 z-20 opacity-0 translate-y-1 group-hover/canvas:opacity-100 group-hover/canvas:translate-y-0 transition duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] pointer-events-none">
                        <LiquidGlass
                          as="span"
                          roundedClass="rounded-lg"
                          interactive={false}
                          className="text-[10px] px-3 py-1.5 text-text-primary pointer-events-none"
                        >
                          Zoom Diagram <span className="text-accent ml-1">↗</span>
                        </LiquidGlass>
                      </div>

                      {/* Glass glare overlay */}
                      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.03)_0%,transparent_60%)]" />
                    </button>

                    {/* Canvas Footer Details */}
                    <div className="relative z-10 mt-auto min-h-[70px] h-auto">
                      <p className="text-[10px] text-muted uppercase font-semibold mb-2">Operational Insight</p>
                      <p className="text-sm text-text-primary/80 leading-relaxed text-pretty">
                        {activeItem.description}
                      </p>
                    </div>
                  </LiquidGlass>
                </motion.div>
              </AnimatePresence>
            </div>

          </div>
        </div>
      </section>

      {/* Lightbox Viewer */}
      <AnimatePresence>
        {lightboxItem ? (
          <ProcessLightbox
            key={lightboxItem.id}
            item={lightboxItem}
            onClose={() => setLightboxItem(null)}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}

export default memo(ProcessLibrary);
