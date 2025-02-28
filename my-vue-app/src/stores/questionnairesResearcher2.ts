/* 2 */

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
}

export const questionnaireData: Questionnaire2[] = [
    {
        title: "Road map to explore the precision intervention",
        sections: [
            {
                name: "null",
                questions: [
                    {
                        id: 1, type: "radio", question: "1) Assessment of initiated intervention for a certain disease of more than (selected) pilot 30 subjects",
                        options: ["ใช่", "ไม่แน่ใจ"]
                    },
                    {
                        id: 2, type: "radio", question: "2) Effectiveness of the intervention reach 80% with in the primary endpoint time",
                        options: ["ใช่", "ไม่"]
                    },
                    {
                        id: 2.1, type: "radio", question: "2.1) Remission when cause of the irregularity no longer exit",
                        options: ["ใช่", "ไม่"]
                    },
                    {
                        id: 2.11, type: "radio", question: "2.1.1) Precision to the originated cell for a selective group pilot",
                        options: ["ใช่", "ไม่แน่ใจ"]
                    },
                    {
                        id: 2.12, type: "radio", question: "2.1.2) Match to what to do further in the E-book",
                        options: ["ใช่", "ไม่แน่ใจ"]
                    },
                    {
                        id: 2.13, type: "radio", question: "2.1.3) Confirm by full scale study",
                        options: ["ใช่", "ไม่แน่ใจ"]
                    },
                    {
                        id: 2.14, type: "radio", question: "2.1.4) Precision intervention",
                        options: ["ใช่", "ไม่แน่ใจ"]
                    },
                    {
                        id: 2.2, type: "radio", question: "2.2) A cell or cells probable to be responsible the expression of symptom or sign of the irregularities",
                        options: ["ใช่", "ไม่แน่ใจ"]
                    },
                    {
                        id: 2.21, type: "radio", question: "2.2.1) Several expressing cell/s",
                        options: ["ใช่", "ไม่"]
                    },
                    {
                        id: 2.210, type: "radio", question: "(A) Match to existing clinical diagnosis in the E-bookto category of the mechanism of pathogenesis",
                        options: ["ใช่", "ไม่แน่ใจ"]
                    },
                    {
                        id: 99, type: "radio", question: "80% Remission with in primary end point time frame",
                    },

                ]
            },

        ]
    }
];
