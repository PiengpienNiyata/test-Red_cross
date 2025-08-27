export interface RouteDefinition {
  route: string;
  title: string;
  interventionAspect?: string[];
  diseaseAspect?: string[];
}

export const routeDefinitions: Record<string, RouteDefinition> = {
  // --- INTERVENTION ASPECTS (Based on Question A-2) ---
  "Intervention_Yes": {
    route: "Route A", // This is the intervention aspect associated with Route A
    title: "Known to Give Remission: Single Target, All-Type Remission",
    interventionAspect: [
      "A single intervention achieves >80% remission",
      "There is no contradiction in treatment response",
      "The treatment is known to act on the originating cell or its direct signaling pathway"
    ],
  },
  "Intervention_No": {
    route: "Not Route A",
    title: "",
    interventionAspect: [
      "A single intervention fails to induce true remission"
    ],
  },
  "Intervention_Uncertain": {
    route: "Not Route A",
    title: "",
    interventionAspect: [
      "It is not clear whether remission occurs across all clinical variants"
    ],
  },

   "Route A": {
    route: "Route A",
    title: "Known to Give Remission: Single Target, All-Type Remission",
    diseaseAspect: [],
  },

  "Route B": {
    route: "Route B",
    title: "Single cell type involved in molecular mechanism",
    diseaseAspect: [
      "Only one originating cell is responsible for disease initiation"
    ],
  },
  "Route C": {
    route: "Route C",
    title: "Contradiction Reveals Complexity",
    diseaseAspect: [
      "Multiple cell types are involved",
      "Clinical variants show opposite or divergent responses to the same intervention",
      "There’s clear contradiction in natural history of the disease and how lesions react",
      "Suggests disease may be misclassified",
      "Goal: Re-examine disease definition and core pathway"
    ],
  },
  "Route D": {
    route: "Route D",
    title: "More than one cells type involvement without stages or types",
    diseaseAspect: [
      "More than one cell type contributes to the disease process",
      "There is no clear contradiction in lesion behavior or treatment response",
      "The treatment fails to induce full remission, but this failure cannot be attributed to known subtypes, stages, or diverging lesion types",
      "This is a “complex but not contradictory” disease"
    ],
  },
  "Route E": {
    route: "Route E",
    title: "Simple Molecular Staging",
    diseaseAspect: [
      "Disease evolves through two molecular stages e.g. early vs. late",
      "Each stage involves the same core signal and triggers",
      "Example: Acute → chronic switch, early → fibrotic lesion"
    ],
  },
  "Route F": {
    route: "Route F",
    title: "Several- Molecular Staging or Branching Model",
    diseaseAspect: [
      "Several-Molecular Staging or Branching Model",
      "Disease progresses through more than two molecular stages or lesions may branch into different paths."
    ],
  },
  "Route G": {
    route: "Route G",
    title: "Multiple molecular Types (Multiple triggers)",
    diseaseAspect: [
      "All lesion types arise from the same upstream signal, suggesting unified origin despite clinical variation",
      "Disease contains molecular types, each triggered by a distinct signal, but originating from the same cell types"
    ],
  },
  "Route H": {
    route: "Route H",
    title: "Multiple molecular Types (Multiple triggers) + severity (intensity) changing Over Time",
    diseaseAspect: [
      "The disease shows both molecular types and stages",
      "More than one type of lesion, all lesion types arise from the same upstream signal and those lesions also change over time."
    ],
  },
};