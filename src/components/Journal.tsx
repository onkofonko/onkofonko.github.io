import { useState, memo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUpRight, Clock, MessageSquare, BookOpen } from "lucide-react";
import { ARTICLES, type Article } from "../data/articles";
import LiquidGlass from "./LiquidGlass";
import BpmnNodeBadge from "./BpmnNodeBadge";
import BaseDrawer from "./BaseDrawer";
import { useModalHistory } from "../hooks/useModalHistory";

const headerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1, ease: [0.25, 0.1, 0.25, 1] as const },
  },
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
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

const AMPERSAND_REGEX = /&/g;
const LT_REGEX = /</g;
const GT_REGEX = />/g;
const BOLD_REGEX = /\*\*(.*?)\*\*/g;
const ITALIC_REGEX = /\*(.*?)\*/g;
const CODE_REGEX = /`(.*?)`/g;

const parseInlineMarkdown = (text: string) => {
  return text
    .replace(AMPERSAND_REGEX, "&amp;")
    .replace(LT_REGEX, "&lt;")
    .replace(GT_REGEX, "&gt;")
    .replace(BOLD_REGEX, "<strong>$1</strong>")
    .replace(ITALIC_REGEX, "<em>$1</em>")
    .replace(
      CODE_REGEX,
      '<code class="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-xs font-mono">$1</code>',
    );
};

function Journal() {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const handleCloseArticle = useCallback(() => {
    setSelectedArticle(null);
  }, []);

  // Close journal drawer on back swipe / browser back button
  useModalHistory(selectedArticle !== null, handleCloseArticle);

  return (
    <>
      <section
        id="journal"
        className="bg-transparent pt-16 md:pt-24 pb-0 scroll-mt-20 md:scroll-mt-24"
      >
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16">
          {/* Header */}
          <motion.div
            variants={headerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="flex items-end justify-between mb-10 md:mb-14"
          >
            <div>
              <h2 className="text-3xl md:text-5xl font-display text-text-primary mb-3 text-balance flex items-center gap-3">
                <BpmnNodeBadge
                  type="intermediate-event-catch-message"
                  className="translate-y-[2px]"
                />
                Recent thought pieces
              </h2>
              <p className="text-sm text-muted max-w-sm text-pretty">
                Analyzing process optimization, systems integrations, and
                enterprise digital transformation frameworks.
              </p>
            </div>
          </motion.div>

          {/* Journal entries */}
          <motion.div
            className="flex flex-col gap-3"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
          >
            {ARTICLES.map((article) => (
              <motion.article key={article.id} variants={cardVariants}>
                <JournalEntry article={article} onOpen={setSelectedArticle} />
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Drawer */}
      <AnimatePresence>
        {selectedArticle ? (
          <JournalDrawer
            article={selectedArticle}
            onClose={handleCloseArticle}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}

interface EntryProps {
  article: Article;
  onOpen: (article: Article) => void;
}

const JournalEntry = memo(function JournalEntry({
  article,
  onOpen,
}: EntryProps) {
  return (
    <LiquidGlass.Button
      onClick={() => onOpen(article)}
      springScale={false}
      whileTap={{ scaleX: 1.008, scaleY: 0.98 }}
      transition={{
        scaleX: { type: "spring", stiffness: 400, damping: 15, mass: 0.6 },
        scaleY: { type: "spring", stiffness: 400, damping: 15, mass: 0.6 },
      }}
      roundedClass="rounded-[40px] sm:rounded-full"
      className="w-full p-3 sm:p-4 justify-start items-center gap-4 sm:gap-6 pointer-events-auto text-left"
    >
      {/* Thumbnail */}
      <div className="flex-shrink-0 size-12 rounded-full overflow-hidden border border-stroke z-10 relative">
        <img
          src={article.image}
          alt={article.title}
          width={48}
          height={48}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
      </div>

      {/* Title */}
      <p className="flex-1 text-sm md:text-base text-text-primary/80 group-hover:text-text-primary transition-colors duration-200 line-clamp-1 z-10 relative font-medium text-pretty">
        {article.title}
      </p>

      {/* Meta */}
      <div className="hidden sm:flex items-center gap-4 flex-shrink-0 z-10 relative tabular-nums">
        <span className="flex items-center gap-1.5 text-xs text-muted">
          <Clock size={11} />
          {article.readTime}
        </span>
        <span className="text-xs text-muted">{article.date}</span>
      </div>

      {/* Arrow */}
      <div className="flex-shrink-0 text-muted group-hover:text-text-primary transition-colors duration-200 z-10 relative pr-2 flex items-center justify-center">
        <ArrowUpRight
          size={16}
          className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      </div>
    </LiquidGlass.Button>
  );
});

interface DrawerProps {
  article: Article;
  onClose: () => void;
}

const JournalDrawer = memo(function JournalDrawer({
  article,
  onClose,
}: DrawerProps) {
  return (
    <BaseDrawer
      title="Journal Thought Piece"
      icon={<BookOpen size={14} className="text-accent" />}
      onClose={onClose}
      maxWidthClass="max-w-4xl"
    >
      {/* Scrollable Content Container */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 select-text">
        {/* Header Image banner */}
        <div className="relative h-48 md:h-56 w-full rounded-2xl overflow-hidden border border-white/10">
          <img
            src={article.image}
            alt={article.title}
            width={800}
            height={450}
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 z-10">
            <span className="text-[10px] text-accent uppercase font-bold bg-accent/20 border border-accent/30 rounded px-2.5 py-0.5">
              {article.subtitle}
            </span>
            <h3 className="text-2xl md:text-3xl font-display text-text-primary mt-2 leading-tight text-balance">
              {article.title}
            </h3>
            <div className="flex gap-4 items-center text-xs text-muted mt-2 tabular-nums">
              <span>{article.date}</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock size={11} />
                {article.readTime}
              </span>
            </div>
          </div>
        </div>

        {/* Article Text Content */}
        <div className="space-y-6 text-text-primary/90 text-sm md:text-base leading-relaxed max-w-none">
          {article.content.map((sec, sIdx) => (
            <div key={sIdx} className="space-y-4">
              {sec.sectionTitle && (
                <h3 className="text-lg font-body text-text-primary font-bold mt-8 text-balance flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                  {sec.sectionTitle}
                </h3>
              )}
              {sec.paragraphs.map((para, pIdx) => (
                <p
                  key={pIdx}
                  className="text-text-primary/80 font-normal text-pretty"
                  dangerouslySetInnerHTML={{
                    __html: parseInlineMarkdown(para),
                  }}
                />
              ))}
              {sec.bulletPoints && (
                <ul className="space-y-2 mt-4 pl-5 list-disc text-muted">
                  {sec.bulletPoints.map((bp, bIdx) => (
                    <li
                      key={bIdx}
                      className="text-xs md:text-sm text-pretty"
                      dangerouslySetInnerHTML={{
                        __html: parseInlineMarkdown(bp),
                      }}
                    />
                  ))}
                </ul>
              )}
              {sec.table && (
                <div className="my-6 rounded-xl border border-white/10 bg-white/5 overflow-x-auto scrollbar-thin">
                  <table className="w-full min-w-[720px] md:min-w-0 text-left border-collapse text-[10px] sm:text-[11px] md:text-xs table-auto">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5 font-display text-text-primary">
                        {sec.table.headers.map((header, hIdx) => (
                          <th
                            key={hIdx}
                            className="px-2 py-2.5 font-semibold uppercase tracking-wider text-[9px] sm:text-[10px] text-accent/90"
                            dangerouslySetInnerHTML={{
                              __html: parseInlineMarkdown(header),
                            }}
                          />
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-text-primary/75">
                      {sec.table.rows.map((row, rIdx) => (
                        <tr
                          key={rIdx}
                          className="hover:bg-white/[0.02] transition-colors duration-150"
                        >
                          {row.map((cell, cIdx) => (
                            <td
                              key={cIdx}
                              className="px-2 py-2 leading-relaxed align-top break-words"
                              dangerouslySetInnerHTML={{
                                __html: parseInlineMarkdown(cell),
                              }}
                            />
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA / Close */}
        <div className="pt-6 border-t border-white/5 flex justify-between items-center gap-4">
          <LiquidGlass.Button
            href={`mailto:ondrej.michal.ockaj@gmail.com?subject=Regarding Article: ${encodeURIComponent(article.title)}`}
            className="px-5 py-2.5 text-xs"
          >
            Discuss this thought piece
            <MessageSquare size={13} />
          </LiquidGlass.Button>
        </div>
      </div>
    </BaseDrawer>
  );
});

export default memo(Journal);
