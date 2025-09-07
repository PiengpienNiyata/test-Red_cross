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
  type: "text" | "radio" | "checkbox" | "files" | "textarea";
  question: string;
  options?: string[];
    levelOptions?: string[];
    mechanismOptions?: string[];
  subOptionsType?: Record<string, "radio" | "checkbox">;
  subOptions?: Record<string, string[]>;
  next?: Record<string, number | "preResult" | "finalResult" | "contradiction">;
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
            id: 101,
            type: "radio",
            question:
              "A-1: Availability of the molecular mechanism of the treatment",
            options: [
              "Yes (Attach your evidence)||files", // (Please define the molecular mechanism : ___)
              "Not available yet",
              "No",
            ],
            next: {
              all: 102,
            },
          },
          {
            id: 102,
            type: "radio",
            question:
              "A-2: Does the chosen intervention produce ≥ 80 % true (molecular) remission in your research data (with molecular evidence)?",
            options: [
              "Yes (Attach your evidence)||files", //, please explain the exact remission rate: ___
              "No",
              "Uncertain",
            ],
            next: {
              all: 103,
            },
          },
          {
            id: 103,
            type: "radio",
            question:
              "A-3: Does the chosen intervention reported in published/public reports produce ≥ 80 % true (molecular) remission (with molecular evidence)?",
            options: [
              "More than 80% efficiency",
              "Close to 80% efficiency",
              "Much less than 80% efficiency",
              "Uncertain",
            ],
            next: {
              all: 104,
            },
          },
          {
            id: 104,
            type: "radio",
            question:
              "A-4: Are there any evidence from the intervention implying that all the type of disease share the same pathway with distinct triggers? (See Glossary: “Molecular types of the disease”)",
            options: ["Yes (insert citation of the reference)||files", "No"],
            next: {
              all: 105,
            },
          },
          {
            id: 105,
            type: "radio",
            question:
              "A-5: Are there any study of subsidence of a particular sign at significantly high rate (more than 80%) in a short period of time?",
            options: [
              "Yes (insert citation of the reference or data collected)||files",
              "No",
            ],
            next: {
              all: 201,
            },
          },
          {
            id: 201,
            type: "radio",
            question:
              "B-1: Are there any staging and/or typing classification of the disease?",
            options: [
              "Yes, both staging and typing. (Please explain : ___ )||files",
              "Yes, only staging.||sub", //
              "Yes, only typing. (Please define the typing : ___)||files",
              "No staging and no typing. (Please explain : ___ )||files",
              // "Uncertain",
            ],

            subOptionsType: {
              "Yes, only staging.": "radio",
            },
            subOptions: {
              "Yes, only staging.": [
                "Have 2 stages  (Please explain : ___ )||files",
                "Have more than 2 stages (Please explain : ___ )||files",
              ],
            },
            next: {
              // "Yes, both staging and typing. (Please explain : ___ )": 202,
              // "Yes, staging only.": 201.5,
              // "Yes, typing only. (Please define the typing : ___)": 202,
              // "No (Please explain : ___ )": 202,
              // Uncertain: 202,
              all: 202,
            },
          },

          {
            id: 201.5,
            type: "radio",
            question:
              "B-1 (Staging): Presence of Staging (See Stages of disease in glossary)",
            options: [
              "Have 2 stages (Please explain : ___ ) ||files",
              "Have more than 2 stages (Please explain : ___ ) ||files",
            ],
            next: {
              all: 202,
            },
          },
          {
            id: 202,
            type: "radio",
            question:
              "B-2: Do you have the criteria for diagnosis of the studying disease?",
            options: ["Yes||crit", "No"],
            next: {
              all: 203,
            },
          },
          {
            id: 203,
            type: "radio",
            question:
              "B-3: Are there any contradiction within the criteria for diagnosis? (see glossary: contradiction)",
            options: [
              "Yes (Please define the contradiction : ___)||files",
              "No",
            ],
            next: {
              all: 204,
            },
          },
          {
            id: 204,
            type: "radio",
            question:
              "B-4: Availability of remission criteria (molecular and/or clinical) (see glossary: remission)",
            options: [
              "Yes||crit",
              "Not yet",
              "Not possible to achieve remission",
            ],
            next: {
              all: 205,
            },
          },
          {
            id: 205,
            type: "radio",
            question:
              "B-5: Availability of timing of the natural end point time frame for the studying disease",
            options: ["Yes (Please define : ___)", "Not able to define"],
            next: {
              all: 206,
            },
          },
          {
            id: 206,
            type: "radio",
            question:
              "B-6: Availability of molecular mechanism of the disease development? (See glossary: Molecular Clinico-Pathological Cascade (Molecular Cascade))",
            options: [
              "Yes, complete ___ ||sub",
              "Not complete ___ ||sub",
              "No",
            ],
            subOptionsType: {
              "Yes, complete ___ ": "checkbox",
              "Not complete ___ ": "checkbox",
            },
            subOptions: {
              "Yes, complete ___ ": ["Autocrine", "Paracrine", "Endrocrime"],
              "Not complete ___ ": ["Autocrine", "Paracrine", "Endrocrime"],
            },

            next: {
              all: 207,
            },
          },
         
          {
  id: 207,
  type: "checkbox", // The type remains checkbox as a base
  question: "B-7: Specify the group of mechanism of disease development? Choose one or more groups that match the molecular mechanisms or histo-pathogenesis.",

  // WHY: We've split the options into two distinct groups for easier handling.
  levelOptions: [
    "Cell : ___",
    "Tissue : ___",
    "Structure : ___",
    "Organ : ___"
  ],
  mechanismOptions: [
    "Inflammation||sub",
    "Proliferation",
    "Dysdifferentiation",
    "Dysfunction",
    "Degeneration",
    "Growth abnormalities Neovascularization",
    "Wounding (tissue or cell damage)",
    "Ecological and environmental factors",
    // "Other : ___",
  ],
  subOptionsType: { Inflammation: "checkbox" },
  subOptions: {
    Inflammation: [
      "Graft versus host (GVH) (HLA)",
      "Innate immunity (Pathogen Associated Molecular Pattern)",
      "Inflammation's Damage Associated Molecular Pattern (DAMP) host derived signal secondary from chronic inflammation or damage cell",
      "Acquire immunity (antigen / antibody reactions)",
      "Innate -acquired immunity",
      "Auto antibody (cGAS auto inflammation)",
      "Inflammaging",
    ],
  },
  next: {
    all: "finalResult",
  },
},
        ],
      },
    ],
  },
];
