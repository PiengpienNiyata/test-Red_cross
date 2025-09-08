export interface RouteDefinition {
  route: string;
  title: string;
}

export const routeDefinitions: Record<string, RouteDefinition> = {
  "Route A": {
    route: "Route A",
    title: "Known to Give Remission: Single Target, All-Type Remission",
  },
  "Route B": {
    route: "Route B",
    title: "Single cell type involved in molecular mechanism",
  },
  "Route C": {
    route: "Route C",
    title: "Contradiction Reveals Complexity",
  },
  "Route D": {
    route: "Route D",
    title: "More than one cells type involvement without stages or types",
  },
  "Route E": {
    route: "Route E",
    title: "Simple Molecular Staging",
  },
  "Route F": {
    route: "Route F",
    title: "Several- Molecular Staging or Branching Model",
  },
  "Route G": {
    route: "Route G",
    title: "Multiple molecular Types (Multiple triggers)",
  },
  "Route H": {
    route: "Route H",
    title: "Multiple molecular Types (Multiple triggers) + severity (intensity) changing Over Time",
  },
};