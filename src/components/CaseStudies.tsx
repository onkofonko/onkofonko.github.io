import { useState, useEffect, memo, useCallback } from "react";
import { motion, AnimatePresence, animate } from "motion/react";
import { AlertCircle, CheckCircle, FileText, Activity } from "lucide-react";
import { CASE_STUDIES, type CaseStudyDetail } from "../data/caseStudies";
import LiquidGlass from "./LiquidGlass";
import BaseDrawer from "./BaseDrawer";
import { useModalHistory } from "../hooks/useModalHistory";
import { parseInlineMarkdown } from "../utils/markdownParser";

const isBuildMode =
  typeof window !== "undefined" && (window as any).__BONEYARD_BUILD;

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] as const },
  },
};

function CaseStudies() {
  const [selectedStudy, setSelectedStudy] = useState<CaseStudyDetail | null>(
    null,
  );

  const handleCloseStudy = useCallback(() => {
    setSelectedStudy(null);
  }, []);

  // Close case study drawer on back swipe / browser back button
  useModalHistory(selectedStudy !== null, handleCloseStudy);

  return (
    <>
      <motion.div
        className="space-y-6 md:space-y-8"
        variants={containerVariants}
        initial={isBuildMode ? "visible" : "hidden"}
        whileInView={isBuildMode ? undefined : "visible"}
        viewport={isBuildMode ? undefined : { once: true, margin: "-80px" }}
      >
        {CASE_STUDIES.map((study) => (
          <motion.article key={study.id} variants={cardVariants}>
            <CaseStudyCard study={study} onOpen={setSelectedStudy} />
          </motion.article>
        ))}
      </motion.div>

      {/* Drawer */}
      <AnimatePresence>
        {selectedStudy ? (
          <CaseStudyDrawer study={selectedStudy} onClose={handleCloseStudy} />
        ) : null}
      </AnimatePresence>
    </>
  );
}

interface CardProps {
  study: CaseStudyDetail;
  onOpen: (study: CaseStudyDetail) => void;
}

const CaseStudyCard = memo(function CaseStudyCard({
  study,
  onOpen,
}: CardProps) {
  return (
    <LiquidGlass
      as="article"
      roundedClass="rounded-2xl"
      className="w-full text-left justify-start items-stretch cursor-pointer"
      onClick={() => onOpen(study)}
      tilt={true}
    >
      {/* Content grid */}
      <div className="relative z-10 grid md:grid-cols-12 gap-6 md:gap-8 p-6 md:p-8 w-full h-full">
        {/* Left column: Title, challenge, solution */}
        <div className="md:col-span-7 flex flex-col gap-6">
          {/* Category badge */}
          <div>
            <span className="inline-block text-[10px] text-muted uppercase font-bold bg-bg/60 backdrop-blur-sm rounded-full px-3 py-1 border border-stroke/50">
              {study.category}
            </span>
          </div>

          {/* Title */}
          <div>
            <h3 className="text-2xl md:text-3xl font-display text-text-primary mb-1 text-balance line-clamp-2">
              {study.title}
            </h3>
            <p className="text-sm text-muted text-pretty">{study.subtitle}</p>
          </div>

          {/* Challenge */}
          <div>
            <div className="flex items-start gap-3 mb-2">
              <AlertCircle
                size={16}
                className="text-muted flex-shrink-0 mt-0.5"
              />
              <div>
                <p className="text-xs text-muted uppercase font-semibold mb-1">
                  Challenge
                </p>
                <p className="text-sm text-text-primary/80 text-pretty">
                  {study.challenge}
                </p>
              </div>
            </div>
          </div>

          {/* Solution */}
          <div>
            <div className="flex items-start gap-3">
              <CheckCircle
                size={16}
                className="text-accent flex-shrink-0 mt-0.5"
              />
              <div>
                <p className="text-xs text-muted uppercase font-semibold mb-1">
                  Solution
                </p>
                <p className="text-sm text-text-primary/80 text-pretty">
                  {study.solution}
                </p>
              </div>
            </div>
          </div>

          {/* Tools */}
          <div className="flex flex-wrap gap-2 pt-2">
            {study.tools.map((tool) => (
              <span
                key={tool}
                className="text-xs bg-stroke/20 text-muted rounded-full px-3 py-1 border border-stroke/30"
              >
                {tool}
              </span>
            ))}
          </div>
        </div>

        {/* Right column: Results, timeline, CTA */}
        <div className="md:col-span-5 flex flex-col justify-between gap-6">
          <div>
            <p className="text-xs text-muted uppercase font-semibold mb-3">
              Key Results
            </p>
            <div className="space-y-3">
              {study.results.map((result) => (
                <div
                  key={result.metric}
                  className="flex items-baseline gap-3 case-study-metric-hover"
                >
                  <span className="text-base md:text-lg font-body font-semibold tracking-tight text-accent tabular-nums case-study-metric-hover-val">
                    {result.metric}
                  </span>
                  <span className="text-xs md:text-sm text-muted text-pretty case-study-metric-hover-desc">
                    {result.description}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-muted uppercase font-semibold mb-2">
              Timeline
            </p>
            <p className="text-sm text-text-primary/80 tabular-nums text-pretty">
              {study.timeline}
            </p>
          </div>

          {/* CTA */}
          <div className="flex justify-start">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase text-accent group-hover:text-text-primary transition-colors duration-300">
              Explore process analysis details →
            </span>
          </div>
        </div>
      </div>
    </LiquidGlass>
  );
});
interface DrawerProps {
  study: CaseStudyDetail;
  onClose: () => void;
}

interface MetricCountUpProps {
  value: string;
}

const NUMERIC_REGEX = /[-+]?\d*\.?\d+/;

const MetricCountUp = memo(function MetricCountUp({
  value,
}: MetricCountUpProps) {
  const numericPart = value.match(NUMERIC_REGEX);
  const target = numericPart ? parseFloat(numericPart[0]) : 0;
  const isNumeric = !!numericPart;

  const startIndex = numericPart ? value.indexOf(numericPart[0]) : -1;
  const prefix = numericPart ? value.substring(0, startIndex) : "";
  const suffix = numericPart
    ? value.substring(startIndex + numericPart[0].length)
    : "";
  const hasPlus = value.trim().startsWith("+");

  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isNumeric) return;
    const controls = animate(0, target, {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1],
      onUpdate(val) {
        setDisplayValue(
          target % 1 === 0 ? Math.floor(val) : parseFloat(val.toFixed(1)),
        );
      },
    });
    return () => controls.stop();
  }, [target, isNumeric]);

  if (!isNumeric) {
    return <span>{value}</span>;
  }

  const displayPrefix =
    hasPlus && displayValue === 0 ? prefix.replace("+", "") : prefix;

  return (
    <span>
      {displayPrefix}
      {displayValue}
      {suffix}
    </span>
  );
});

const drawerContentVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
};

const drawerItemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, damping: 25, stiffness: 220 },
  },
};

const CaseStudyDrawer = memo(function CaseStudyDrawer({
  study,
  onClose,
}: DrawerProps) {
  return (
    <BaseDrawer
      title="Process Audit Case File"
      icon={<Activity size={14} className="text-accent" />}
      onClose={onClose}
      maxWidthClass="max-w-4xl"
    >
      {/* Scrollable Content Container */}
      <motion.div
        variants={drawerContentVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 select-text"
      >
        {/* Header */}
        <motion.div variants={drawerItemVariants}>
          <span className="text-[10px] text-accent uppercase font-bold bg-accent/20 border border-accent/30 rounded-xl px-2.5 py-0.5">
            {study.category}
          </span>
          <h3 className="text-2xl md:text-3xl font-display text-text-primary mt-2 text-balance">
            {study.title}
          </h3>
          <p className="text-xs text-muted mt-0.5 text-pretty">
            {study.subtitle}
          </p>
        </motion.div>

        {/* Core Info */}
        <motion.div variants={drawerItemVariants} className="space-y-4">
          <h3 className="text-xs text-muted uppercase border-b border-stroke pb-1 text-balance">
            Client Profile
          </h3>
          <p
            className="text-sm text-text-primary/95 font-normal leading-relaxed text-pretty"
            dangerouslySetInnerHTML={{
              __html: parseInlineMarkdown(study.client),
            }}
          />
          <p
            className="text-sm text-muted leading-relaxed mt-2 text-pretty"
            dangerouslySetInnerHTML={{
              __html: parseInlineMarkdown(study.longDescription),
            }}
          />
        </motion.div>

        {/* Results Grid */}
        <motion.div variants={drawerItemVariants} className="space-y-4">
          <h3 className="text-xs text-muted uppercase border-b border-stroke pb-1 text-balance">
            Proven Operations Impact
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {study.results.map((res) => (
              <div
                key={res.metric}
                className="bg-white/[0.02] border border-white/5 rounded-xl p-3 text-center"
              >
                <p className="text-lg md:text-xl font-body font-semibold tracking-tight text-accent tabular-nums">
                  <MetricCountUp value={res.metric} />
                </p>
                <p className="text-[10px] text-muted uppercase mt-1 text-pretty">
                  {res.description}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* AS-IS vs TO-BE comparison */}
        <motion.div variants={drawerItemVariants} className="space-y-4">
          <h3 className="text-xs text-muted uppercase border-b border-stroke pb-1 text-balance">
            Process Modeling & Auditing
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {/* AS-IS */}
            <div className="bg-red-500/[0.02] border border-red-500/10 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase mb-3">
                <div className="size-1.5 rounded-full bg-red-400" />
                <span>Legacy Source Materials</span>
              </div>
              <ul className="space-y-3">
                {study.asIsFlow.map((step) => (
                  <li key={step} className="text-xs text-muted flex gap-2">
                    <span className="text-red-400/80 flex-shrink-0">✕</span>
                    <span className="leading-relaxed text-pretty">{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* TO-BE */}
            <div className="bg-emerald-500/[0.02] border border-emerald-500/10 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase mb-3">
                <div className="size-1.5 rounded-full bg-emerald-400" />
                <span>BPMN Process Modeling</span>
              </div>
              <ul className="space-y-3">
                {study.toBeFlow.map((step) => (
                  <li
                    key={step}
                    className="text-xs text-text-primary/95 flex gap-2"
                  >
                    <span className="text-emerald-400 flex-shrink-0">✓</span>
                    <span className="leading-relaxed text-pretty">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Methodology & Timeline */}
        <motion.div
          variants={drawerItemVariants}
          className="grid md:grid-cols-2 gap-6"
        >
          <div className="space-y-3">
            <h4 className="text-xs text-muted uppercase border-b border-stroke pb-1 text-balance">
              Methodology
            </h4>
            <ul className="space-y-2">
              {study.methodology.map((meth) => (
                <li
                  key={meth}
                  className="text-xs text-muted flex items-center gap-2"
                >
                  <span className="size-1 rounded-full bg-accent/60" />
                  <span className="text-pretty">{meth}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs text-muted uppercase border-b border-stroke pb-1 text-balance">
              Key Deliverables
            </h4>
            <ul className="space-y-2">
              {study.deliverables.map((del) => (
                <li
                  key={del}
                  className="text-xs text-text-primary/80 flex items-center gap-2"
                >
                  <FileText size={11} className="text-accent flex-shrink-0" />
                  <span className="text-pretty">{del}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* CTA / Close */}
        <motion.div
          variants={drawerItemVariants}
          className="pt-6 border-t border-white/5 flex justify-between items-center gap-4"
        >
          <LiquidGlass.Button
            href="mailto:ondrej.michal.ockaj@gmail.com"
            className="px-5 py-2.5 text-xs"
            magnetic={true}
            tilt={true}
            magneticStrength={0.02}
          >
            Request project details ↗
          </LiquidGlass.Button>
        </motion.div>
      </motion.div>
    </BaseDrawer>
  );
});

export default memo(CaseStudies);
