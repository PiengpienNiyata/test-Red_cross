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
  subOptionsType?: Record<string, "radio" | "checkbox">;
  subOptions?: Record<string, string[]>;
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
            id: 101,
            type: "radio",
            question:
              "Availability of the molecular mechanism of the treatment",
            options: [
              "Yes (Please submit Ani-IL-8, Inhibit TLR-2)||files",
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
            question: " Availability of remission result at the rate of 80%",
            options: [
              "Yes (Attach your data with molecular evidence.)||files",
              "No",
              "Uncertain",
            ],
            next: {
              "Yes (Attach your data with molecular evidence.)||files":
                103,
              No: 103,
              Uncertain: "preResult",
            },
          },
          {
            id: 103,
            type: "radio",
            question:
              "Efficiency from available data of the designated product",
            options: [
              "More than 80% efficiency",
              "Close to 80% efficiency",
              "Much less than 80% efficiency",
              "Not certain",
            ],
            next: {
              all: 104,
            },
          },
          {
            id: 104,
            type: "radio",
            question:
              "Are there any evidence from the intervention implying that all the type of disease share the same pathway with distinct triggers?",
            options: [
              "Yes , Please provide citation of the reference. Guideline ___ and ___",
              "No",
            ],
            next: {
              all: 105,
            },
          },
          {
            id: 105,
            type: "radio",
            question:
              "Are there any study of subsidence of a particular sign at significantly high rate (more than 80%) in a short period of time?",
            options: [
              "Yes (Please define citation of the reference or data collected)||files",
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
              "Are there any staging and/or typing classification of the disease? (see glossary Molecular stages of disease and B-1 explanations.)",
            options: [
              "Yes, both staging and typing. ref : ___",
              "Yes, staging only.",
              "Yes, typing only. (Please define the typing : ___)",
              "No",
              "Uncertain",
            ],
            next: {
              "Yes, both staging and typing. ref : ___": 202,
              "Yes, staging only.": 201.5,
              "Yes, typing only. (Please define the typing : ___)": 202,
              No: 202,
              Uncertain: "preResult",
            },
          },
          {
            id: 201.5,
            type: "radio",
            question: "Presence of Staging (See Stages of disease in glossary)",
            options: ["Have 2 stages", "Have more than 2 stages"],
            next: {
              all: 202,
            },
          },
          {
            id: 202,
            type: "radio",
            question:
              "Do you have the criteria for diagnosis of the studying disease?",
            options: ["Yes (Please define the criteria : ___)", "No"],
            next: {
              all: 203,
            },
          },
          {
            id: 203,
            type: "radio",
            question:
              "Are there any contradiction within the criteria for diagnosis?",
            options: ["Yes (Please define the contradiction : ___)", "No"],
            next: {
              all: 204,
            },
          },
          {
            id: 204,
            type: "radio",
            question:
              "Availability of the criteria of remission (molecular and/or clinical)",
            options: [
              "Yes (Please define the contradiction : ___)",
              "No",
              "Impossible to achieve remission",
            ],
            next: {
              all: 205,
            },
          },
          {
            id: 205,
            type: "radio",
            question:
              "Availability of timing of the natural end point time frame for the studying disease.",
            options: ["Yes (Please define : ___)", "Not able to define"],
            next: {
              all: 206,
            },
          },
          {
            id: 206,
            type: "radio",
            question:
              "Availability of molecular mechanism of the disease development?",
            options: [
              "Yes, complete IL-1, LTB-4, TRL-2, IL-8||sub",
              "Not complete||sub",
              "No",
            ],
            subOptionsType: {
              "Yes, complete IL-1, LTB-4, TRL-2, IL-8": "checkbox",
              "Not complete": "checkbox",
            },
            subOptions: {
              "Yes, complete IL-1, LTB-4, TRL-2, IL-8": [
                "Autocrine elaborate signal, receptor and transduction",
                "Paracrine list of cell signal involved initial signal and, seal segment signals",
                "Endrocrime naming",
              ],
              "Not complete": ["Autocrine", "Paracrine", "Endrocrime"],
            },

            next: {
              all: 207,
            },
          },
          {
            id: 207,
            type: "checkbox",
            question:
              "Specify the group of mechanism of disease development? Choose one or more groups that match the molecular mechanisms or histo-pathogenesis.",
            options: [
              "Cell",
              "Tissue",
              "Structure (hair follicle, glomeruli, etc.)",
              "Organ",
              "Inflammation||sub",
              "Proliferation Keratinocyte at pilosebaceous duct",
              "Dysdifferentiation",
              "Dysfunction",
              "Degeneration",
              "Growth abnormalities Neovascularization",
              "Wounding (tissue or cell damage)",
              "Ecological and environmental factors",
            ],
            subOptionsType: { Inflammation: "radio" },
            subOptions: {
              Inflammation: [
                "Innate Immunity",
                "Innate acquire immunity",
                "Acquire immunity",
                "Toxic or infectious",
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
