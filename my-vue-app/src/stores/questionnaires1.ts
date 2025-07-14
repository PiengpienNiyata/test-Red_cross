export interface Questionnaire {
  title: string;
  sections: Section[];
}

export interface Section {
  name: string;
  questions: Question[];
}

export interface Question {
  id: number;
  type: "text" | "radio" | "checkbox" | "textarea";
  question: string;
  options?: string[];
}

export const questionnaireData: Questionnaire[] = [
  {
    title: "null",
    sections: [
      {
        name: "Personal Information",
        questions: [
          { id: 1001, type: "text", question: "Project Leader's Name" },
          { id: 1002, type: "text", question: "Project Name" },
          { id: 1003, type: "text", question: "Branch and Research Group Information" },
          { id: 1004, type: "text", question: "Phone Number" },
          { id: 1005, type: "text", question: "Email Address" },
          // { id: 1001, type: "text", question: "Name" },
          // { id: 1002, type: "text", question: "Email Address" },
          { id: 1006, type: "text", question: "Chosen Disease Name" },
          { id: 1007, type: "text", question: "Chosen intervention" },
        ]
      },
      {
        name: "Research questions",
        questions: [
          {
            id: 1008,
            type: "textarea",
            question: "Principle",
          },
          {
            id: 1009,
            type: "textarea",
            question: "Factual Statement",
          },
          {
            id: 1010,
            type: "textarea",
            question: "Implication",
          },
]
      },
      {
        name: "Molecular signaling principle",
        questions: [
          {
            id: 1011,
            type: "textarea",
            question: "Principle",
          },
          {
            id: 1012,
            type: "textarea",
            question: "Factual Statement",
          },
          {
            id: 1013,
            type: "textarea",
            question: "Implication",
          },
        ]
      }
    ]
  }
];