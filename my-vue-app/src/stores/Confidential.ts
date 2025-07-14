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
  answer?: string | string[];
}

export const questionnaireData: Questionnaire2[] = [
  {
    title: "Confidantiality Level of the remission or controlling",
    sections: [
      {
        name: "null",
        questions: [
          {
            id: 3001,
            type: "radio",
            question:
              "Choose and answer only one category.",
            options: [
              "Remission of the disease",
              "Remission and control of the disease",
              "Symptomatic treatment",
            ],
            subOptionsType: {
              "Remission of the disease": "radio",
              "Remission and control of the disease": "radio",
              "Symptomatic treatment": "radio",
            },
            subOptions: {
              "Remission of the disease": [
                "Level 3",
                "Level 2",
                "Level 1",
                "Unlikely",
              ],
              "Remission and control of the disease": [
                "Level 3",
                "Level 2",
                "Level 1",
                "Unlikely",
              ],
              "Symptomatic treatment": [
                "Level 3",
                "Level 2",
                "Level 1",
                "Unlikely",
              ],
            },
          },
        ],
      },
    ],
  },
];
