import { parseCaseStudy, type CaseStudyDetail } from "../utils/markdownParser";

// Eagerly import all markdown case studies under the caseStudies subfolder
const caseStudyModules = import.meta.glob("./caseStudies/*.md", {
  query: "?raw",
  eager: true,
}) as Record<string, { default: string }>;

export type { CaseStudyDetail };

// Map, parse, and resolve case studies eagerly at module load time
export const CASE_STUDIES: CaseStudyDetail[] = Object.entries(
  caseStudyModules,
).map(([path, module]) => {
  const filename = path.split("/").pop() || "";
  const study = parseCaseStudy(filename, module.default);

  // Convert ID to number if numeric, to preserve type consistency with the UI
  let id: number | string = study.id;
  if (typeof id === "string" && !isNaN(Number(id))) {
    id = Number(id);
  }

  return {
    ...study,
    id,
  };
});
