//ทำในไฟล์นี้
export interface Questionnaire2 {
  title: string;
  sections: Section2[];
}

export interface Section2 {
  name: string;
  questions: Question2[];
}

export interface Question2 {
  id: number;
  type: "text" | "radio" | "checkbox";
  question: string;
  options?: string[];
  next?: Record<string, number | "preResult" | "finalResult">;
  answer?: string | string[];
}

export const questionnaireData: Questionnaire2[] = [
  {
    title: "Road map to explore the precision intervention",
    sections: [
      {
        name: "null",
        questions: [
          {
            id: 100,
            type: "radio",
            question:
              "Single Intervention could archieve <80% true molecular remission",
            options: ["Yes", "Uncertain", "No"],
            next: { Yes: 200, No: 301, Uncertain: "preResult" },
          },
          {
            id: 200,
            type: "radio",
            question: "Have any explicit molecular target?",
            options: [
              "+ Explicit Molecular target if the intervention <submit evidence>",
              "No explicit explanatory molecular evidence or publications",
            ],
            next: {
              "+ Explicit Molecular target if the intervention <submit evidence>":
                201,
              "No explicit explanatory molecular evidence or publications": 220,
            },
          },
          //final result = Route A
                    {
            id: 201,
            type: "radio",
            question: "Route A",
            options: ["Next"],
            next: { Next: "finalResult" },
          },
          {
            id: 220,
            type: "radio",
            question:
              "No explicit explanatory molecular evidence or publications",
            options: [
              "Treatment can treat all distinct clinical presentations",
              "Treatment could archive remission in some type but couldn't treat all distinct clinical presentations",
            ],
            next: {
              "Treatment can treat all distinct clinical presentations": 230,
              "Treatment could archive remission in some type but couldn't treat all distinct clinical presentations": 302,
            },
          },
          {
            id: 230,
            type: "radio",
            question: "Treatment can treat all distinct clinical presentations",
            options: [
              "Presence of Staging See Stages glossary",
              "Presence of Molecular types. See molecular types in glossary",
              "Only one clinical type presentation",
            ],
            next: {
              "Presence of Staging See Stages glossary": 231,
              "Presence of Molecular types. See molecular types in glossary": 232,
              "Only one clinical type presentation": 233,
            },
          },
          {
            id: 231,
            type: "radio",
            question: "Presence of Staging See Stages glossary",
            options: ["Stage 1", "Stage 2"],
            next: { "Stage 1": 234, "Stage 2": 235 },
          },
          {
            id: 232,
            type: "radio",
            question:
              "Presence of Molecular types. See molecular types in glossary",
            options: ["Yes", "Uncertain"],
            next: { Yes: 236, Uncertain: "preResult" },
          },
          {
            id: 233,
            type: "radio",
            question: "Only one clinical type presentation",
            options: ["Yes", "Uncertain"],
            next: { Yes: 240, Uncertain: "preResult" },
          },
          {
            id: 234,
            type: "radio",
            question: "Route E",
            options: ["Next"],
            next: { Next: 500 },
          },
          {
            id: 235,
            type: "radio",
            question: "Route F",
            options: ["Next"],
            next: { Next: 500 },
          },
          {
            id: 236,
            type: "radio",
            question:
              "Draw and elaborate how the designated treatment target to each type.",
            options: ["Yes", "Uncertain"],
            next: { Yes: 237, Uncertain: "preResult" },
          },
          {
            id: 237,
            type: "radio",
            question:
              "Check whether the treatment achieves remission earlier than natural endpoint.",
            options: ["Presence of Staging See Stages glossary", "No Staging"],
            next: {
              "Presence of Staging See Stages glossary": 238,
              "No Staging": 239,
            },
          },
          {
            id: 238,
            type: "radio",
            question: "Route H",
            options: ["Next"],
            next: { Next: 500 },
          },
          {
            id: 239,
            type: "radio",
            question: "Route G",
            options: ["Next"],
            next: { Next: 500 },
          },
          {
            id: 240,
            type: "radio",
            question: "Assume Single originating cell type",
            options: ["Yes", "Uncertain"],
            next: { Yes: 241, Uncertain: "preResult" },
          },
                    {
            id: 241,
            type: "radio",
            question: "Route B",
            options: ["Next"],
            next: { Next: 242 },
          },
                    {
            id: 242,
            type: "radio",
            question: "See criteria for diagnosis",
            options: ["Yes", "Uncertain"],
            next: { Yes: 503, Uncertain: "preResult" },
          },
          {
            id: 250,
            type: "radio",
            question: "Assume Single originating cell type",
            options: ["Yes", "Uncertain"],
            next: { Yes: 500, Uncertain: "preResult" },
          },
          {
            id: 301,
            type: "radio",
            question: "Be able to archive symptomatic control",
            options: ["seen clinical improvement"],
            next: { "seen clinical improvement": "preResult" },
          },
          {
            id: 302,
            type: "radio",
            question:
              "(Waiting more information) See contradiction and explain disease natural history In glossary ",
            options: ["Route C", "Route D"],
            next: { "Route C": 303, "Route D": 304 },
          },
          {
            id: 303,
            type: "radio",
            question: "(Waiting more information) Route C",
            options: ["Next"],
            next: { Next: 305 },
          },
          {
            id: 304,
            type: "radio",
            question: "(Waiting more information) Route D",
            options: ["Next"],
            next: { Next: 305 },
          },
          {
            id: 305,
            type: "radio",
            question: "See criteria for diagnosis",
            options: ["Yes", "Uncertain"],
            next: { Yes: 306, Uncertain: "preResult" },
          },
          {
            id: 306,
            type: "radio",
            question:
              "Presence of contradiction in criteria for diagnosis and/or natural history => may be syndrome or more than one pathway involve",
            options: ["Yes", "Uncertain"],
            next: { Yes: 503, Uncertain: "preResult" },
          },
          {
            id: 500,
            type: "radio",
            question: "See criteria for diagnosis",
            options: ["Yes", "Uncertain"],
            next: { Yes: 501, Uncertain: "preResult" },
          },
          {
            id: 501,
            type: "radio",
            question:
              "See contradiction in glossary and explain disease natural history",
            options: ["Yes", "Uncertain"],
            next: { Yes: 502, Uncertain: "preResult" },
          },
          {
            id: 502,
            type: "radio",
            question: "No contradiction",
            options: ["Yes", "Uncertain"],
            next: { Yes: 503, Uncertain: "preResult" },
          },
          {
            id: 503,
            type: "radio",
            question:
              "List cells involved in the relation to Histopathology and molecular mechanism",
            options: ["Yes", "Uncertain"],
            next: { Yes: 504, Uncertain: "preResult" },
          },
          {
            id: 504,
            type: "radio",
            question: "Identify originating cells",
            options: ["Yes", "Uncertain"],
            next: { Yes: 505, Uncertain: "preResult" },
          },
          {
            id: 505,
            type: "radio",
            question:
              "Which mechanism involvement Deductive molecular analysis ",
            options: ["Yes", "Uncertain"],
            next: { Yes: 506, Uncertain: "preResult" },
          },
          {
            id: 506,
            type: "radio",
            question: "Identify initial signals",
            options: ["Yes", "Uncertain"],
            next: { Yes: "finalResult", Uncertain: "preResult" },
          },

          /* { "Presence of Staging See Stages glossary": Route H, "No Staging": Route G } */
          /* { id: 1001, type: "text", question: ".." }, */
        ],
      },
    ],
  },
];
