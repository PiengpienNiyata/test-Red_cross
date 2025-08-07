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
              "A-1: Availability of the molecular mechanism of the treatment",
            options: [
              "Yes (Please define the molecular mechanism : ___) (Attach your evidence)||files",
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
            question: "A-2: Availability of remission result at the rate of 80%",
            options: [
              "Yes, please explain the exact remission rate: ___ (Attach your data with molecular evidence)||files",
              "No",
              "Uncertain",
            ],
            next: {
              // "Yes (Attach your data with molecular evidence.)||files":
              //   103,
              all: 103,
              // Uncertain: "preResult",
            },
          },
          {
            id: 103,
            type: "radio",
            question:
              "A-3: Efficiency from available data of the designated product",
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
              "A-4: Are there any evidence from the intervention implying that all the type of disease share the same pathway with distinct triggers?",
            options: [
              "Yes , Please explain : ___ (Attach your evidence) ||files",
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
              "A-5: Are there any study of subsidence of a particular sign at significantly high rate (more than 80%) in a short period of time?",
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
              "B-1: Are there any staging and/or typing classification of the disease?",
            options: [
              "Yes, both staging and typing. ref : ___||files",
              "Yes, staging only.",//||sub
              "Yes, typing only. (Please define the typing : ___)||files",
              "No (Please explain : ___ )||files",
              "Uncertain",
            ],

            // subOptionsType: {
            //   "Yes, staging only.": "radio",
            // },
            // subOptions: {
            //   "Yes, staging only.": [
            //     "Have 2 stages ||files",
            //     "Have more than 2 stages ||files",
            //   ],
            // },


            
            next: {
              "Yes, both staging and typing. ref : ___": 202,
              "Yes, staging only.": 201.5,
              "Yes, typing only. (Please define the typing : ___)": 202,
              "No (Please explain : ___ )": 202,
              Uncertain: 202,
            },

          },
          {
            id: 201.5,
            type: "radio",
            question: "B-1 (Staging): Presence of Staging (See Stages of disease in glossary)",
            options: ["Have 2 stages (Please explain : ___ ) ||files", "Have more than 2 stages (Please explain : ___ ) ||files"],
            next: {
              all: 202,
            },
          },
          {
            id: 202,
            type: "radio",
            question:
              "B-2: Do you have the criteria for diagnosis of the studying disease?",
            options: ["Yes (Please define the criteria : ___)||files", "No"],
            next: {
              all: 203,
            },
          },
          {
            id: 203,
            type: "radio",
            question:
              "B-3: Are there any contradiction within the criteria for diagnosis?",
            options: ["Yes (Please define the contradiction : ___)||files", "No"],
            next: {
              all: 204,
            },
          },
          {
            id: 204,
            type: "radio",
            question:
              "B-4: Availability of the criteria of remission (molecular and/or clinical)",
            options: [
              "Yes (Please define the criteria : ___)||files",
              "No criteria of remission",
              "Impossible to achieve remission (please define ___)||files",
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
              "B-6: Availability of molecular mechanism of the disease development?",
            options: [
              "Yes, complete ___ ||sub",
              "Not complete ___ ||sub",
              "No",
            ],
            subOptionsType: {
              "Yes, complete ___ ": "radio",
              "Not complete ___ ": "radio",
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
            type: "checkbox",
            question:
              "B-7: Specify the group of mechanism of disease development? Choose one or more groups that match the molecular mechanisms or histo-pathogenesis.",
            options: [
              //Cell, Tissue, Structure, Organ, I need to change these 4 options to radio instead of checkbox (can choose only one)
              "group1|/|Cell : ___",
              "group1|/|Tissue : ___",
              "group1|/|Structure : ___",
              "group1|/|Organ : ___",

              "Inflammation||sub",
              "Proliferation",
              "Dysdifferentiation",
              "Dysfunction",
              "Degeneration",
              "Growth abnormalities Neovascularization",
              "Wounding (tissue or cell damage)",
              "Ecological and environmental factors",
              "Other : ___",
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
