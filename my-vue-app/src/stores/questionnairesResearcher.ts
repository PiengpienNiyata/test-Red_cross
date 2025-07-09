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
  type: "text" | "radio" | "checkbox";
  question: string;
  options?: string[];
}

export const questionnaireData: Questionnaire[] = [
  {
    title: "Questionnaire for Researcher",
    sections: [
      {
        name: "null",
        questions: [
          { id: 1001, type: "text", question: "Project Leader's Name" },
          { id: 1002, type: "text", question: "Project Name" },
          { id: 1003, type: "text", question: "Branch and Research Group Information" },
          { id: 1004, type: "text", question: "Phone Number" },
          { id: 1005, type: "text", question: "Email Address" }
        ]
      },
      {
        name: "Your Research Role in Finding the Originated Cell of Diseases Related to the Research",
        questions: [
          {
            id: 1006,
            type: "radio",
            question: "Previous research has taught us it is about",
            options: ["Disease treatment", "Treating the consequences of disease", "Symptom treatment"]
          },
          {
            id: 1007,
            type: "checkbox",
            question: "If the research on disease treatment, what do you think would be the final outcome?",
            options: ["Remission (recovery)", "Control", "Prevention", "Not sure"]
          },
          {
            id: 1008,
            type: "radio",
            question: "If your research leads to a cure (remission), is there naturally a criteria for diagnosis?",
            options: ["Yes (send information to Dr. Wipasakorn Klaiketu)", "No"]
          },
          {
            id: 1009,
            type: "radio",
            question: "If there are criteria for diagnosis, does it result in natural remission/cure?",
            options: ["Yes (send information to Dr. Wipasakorn Klaiketu)", "Not yet"]
          },
          {
            id: 1010,
            type: "radio",
            question: "Do you expect the effectiveness of the research treatment to lead to 80% completeness based on the remission criteria for those who meet the diagnostic criteria?",
            options: ["Reaches 80%", "Close to 80%", "Less than 80%"]
          },
          {
            id: 1011,
            type: "radio",
            question: "Is there molecular information about the disease mechanism?",
            options: ["Yes", "Not yet", "No (unknown)"]
          },
          {
            id: 1012,
            type: "radio",
            question: "Is there molecular information about the treatment mechanism?",
            options: ["Yes", "Not yet", "No (unknown)"]
          }
        ]
      },
      {
        name: "Finding the Originated Cell from the Disease Mechanism",
        questions: [
          {
            id: 1013,
            type: "checkbox",
            question: "The molecular information you are interested in is within the disease mechanism. Please specify (select more than 1):",
            options: [
              "Inflammation",
              "Proliferation",
              "Wounding (tissue or cell damage)",
              "Dysdifferentiation",
              "Degeneration",
              "Growth abnormalities",
              "Dysfunction",
              "Ecological and environmental factors"
            ]
          },
          {
            id: 1014,
            type: "radio",
            question: "Please specify the final goal of the route you can analyze on the roadmap as follows:",
            options: [
              "Remission and protection (prevents all predisposing factors)",
              "Control to normal, but the root cause still exists, so treatment cannot be stopped yet",
              "Prevention: the disease resolves on its own, but research helps reduce the chance of recurrence (from some predisposing factors)"
            ]
          }
        ]
      }
    ]
  }
];