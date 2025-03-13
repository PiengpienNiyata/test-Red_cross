// /* 2 */

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
                        id: 11001, type: "radio", question: "1) Assessment of initiated intervention for a certain disease of more than (selected) pilot 30 subjects",
                        options: ["ใช่", "ไม่แน่ใจ"],
                        next: { "ใช่": 11002, "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 11002, type: "radio", question: "2) Effectiveness of the intervention reach 80% within the primary endpoint time",
                        options: ["ใช่", "ไม่", "ไม่แน่ใจ"],
                        next: { "ใช่": 11002.1, "ไม่": 11002.2, "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 11002.1, type: "radio", question: "2.1) Remission when cause of the irregularity no longer exists",
                        options: ["ใช่", "ไม่", "ไม่แน่ใจ"],
                        next: { "ใช่": 11002.11, "ไม่": 11002.2, "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 11002.11, type: "radio", question: "2.1.1) Precision to the originated cell for a selective group pilot",
                        options: ["ใช่", "ไม่แน่ใจ"],
                        next: { "ใช่": 11002.12, "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 11002.12, type: "radio", question: "2.1.2) Match to what to do further in the E-book",
                        options: ["ใช่", "ไม่แน่ใจ"],
                        next: { "ใช่": 11002.13, "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 11002.13, type: "radio", question: "2.1.3) Confirm by full-scale study",
                        options: ["ใช่", "ไม่แน่ใจ"],
                        next: { "ใช่": 11002.14, "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 11002.14, type: "radio", question: "2.1.4) Precision intervention",
                        options: ["ใช่", "ไม่แน่ใจ"],
                        next: { "ใช่": 11099, "ไม่แน่ใจ": "preResult" }
                    },
                    //end of precision invention route A

                    {
                        id: 11002.2, type: "radio", question: "2.2) A cell or cells probable to be responsible the expression of symptom or sign of the irregularities",
                        options: ["ใช่", "ไม่แน่ใจ"],
                        next: { "ใช่": 11002.21, "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 11002.21, type: "radio", question: "2.2.1) Several expressing cell/s",
                        options: ["ใช่", "ไม่", "ไม่แน่ใจ"],
                        next: { "ใช่": 110022.210, "ไม่": 11002.22, "ไม่แน่ใจ": "preResult" }
                    },
                    
                    //Route B
                    {
                        id: 11002.22, type: "radio", question: "2.2.2) Solely induce sign of irregularities by a signal cell",
                        options: ["ใช่", "ไม่แน่ใจ"],
                        next: { "ใช่": 11002.221, "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 11002.221, type: "radio", question: "2.2.2.1) Originated cell",
                        options: ["ใช่", "ไม่แน่ใจ"],
                        next: { "ใช่": 11002.222, "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 11002.222, type: "radio", question: "2.2.2.2) Match to signal or receptor if expressing",
                        options: ["ใช่", "ไม่แน่ใจ"],
                        next: { "ใช่": 11002.223, "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 11002.223, type: "radio", question: "2.2.2.1) Intervention",
                        options: ["ใช่", "ไม่แน่ใจ"],
                        next: { "ใช่": 11002.224, "ไม่แน่ใจ": "preResult" }
                    },
                    
                    //** */
                    {
                        id: 11002.224, type: "radio", question: "Sustainable normalization the originate cell",
                        options: ["ใช่", "ไม่", "ไม่แน่ใจ"],
                        next: { "ใช่": 11002.226, "ไม่": 11002.225, "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 11002.225, type: "radio", question: "Controller cell",
                        options: ["ใช่", "ไม่แน่ใจ"],
                        next: { "ใช่": "finalResult", "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 11002.226, type: "radio", question: "(2.2.2.2) Remission",
                        options: ["ใช่", "ไม่แน่ใจ"],
                        next: { "ใช่": 11099, "ไม่แน่ใจ": "preResult" }
                    },
                    //end of route B

                    //A2.2.1
                    {
                        id: 110022.210, type: "radio", question: "(A) Match to existing clinical diagnosis in the E-book to category of the mechanism of pathogenesis",
                        options: ["ใช่", "ไม่แน่ใจ"],
                        next: { "ใช่": 11002.2101, "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 11002.2101, type: "radio", question: "Type**",
                        options: ["ใช่", "ไม่", "ไม่แน่ใจ"],
                        next: { "ใช่": 11002.2102, "ไม่": 11002.2110, "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 11002.2102, type: "radio", question: "Draw cascade",
                        options: ["ใช่", "ไม่แน่ใจ"],
                        next: { "ใช่": 11002.21025, "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 11002.21025, type: "radio", question: "Identify the originated cell and expression cell each typed** and each stage*",
                        options: ["Route G", "Route H", "ไม่แน่ใจ"],
                        next: { "Route G": 11002.2103, "Route H": 11002.2104, "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 11002.2103, type: "radio", question: "Route G Set Combination of intervention of originated cell and a stage* and designed typed** depended to the purposed",
                        options: ["ใช่", "ไม่แน่ใจ"],
                        next: { "ใช่": 11002.2105, "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 11002.2104, type: "radio", question: "Route H Set Combination of intervention of Another stage* and typed** depended the purposed",
                        options: ["ใช่", "ไม่แน่ใจ"],
                        next: { "ใช่": 11002.2105, "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 11002.2105, type: "radio", question: "Set signal intervention",
                        options: ["ใช่", "ไม่แน่ใจ"],
                        next: { "ใช่": 11002.2106, "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 11002.2106, type: "radio", question: "80% of the amount a sign or symptom of a type** is clear in a set of time frame that meet satisfaction (expectation)",
                        options: ["ใช่", "ไม่แน่ใจ"],
                        next: { "ใช่": 11099, "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 11002.2110, type: "radio", question: "(A 2.2.1) Stage*",
                        options: ["ใช่", "ไม่", "ไม่แน่ใจ"],
                        next: { "ใช่": 11002.2111, "ไม่": 11002.21101, "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 11002.2111, type: "radio", question: "Draw cascade",
                        options: ["ใช่", "ไม่แน่ใจ"],
                        next: { "ใช่": 11002.2112, "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 11002.2112, type: "radio", question: "Identified the originated cell and expression cell",
                        options: ["Stage 1", "Stage 2"],
                        next: { "Stage 1": 11002.2113, "Stage 2": 11002.2115, "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 11002.2113, type: "radio", question: "Stage 1*",
                        options: ["ใช่", "ไม่แน่ใจ"],
                        next: { "ใช่": 11002.2114, "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 11002.2114, type: "radio", question: "Route E Combination of intervention of originated cell and expressing cell of a stage* cascade",
                        options: ["ใช่", "ไม่แน่ใจ"],
                        next: { "ใช่": 11002.2229, "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 11002.2115, type: "radio", question: "Stage 2*",
                        options: ["ใช่", "ไม่แน่ใจ"],
                        next: { "ใช่": 11002.2116, "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 11002.2116, type: "radio", question: "Route F Combination of intervention of originated cell and expressing cell of another stage 2 cascade",
                        options: ["ใช่", "ไม่แน่ใจ"],
                        next: { "ใช่": 11002.2229, "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 11002.21101, type: "radio", question: "(B) Evidently explainable of obvious contrast in irregularity natural courses",
                        options: ["ใช่", "ไม่", "ไม่แน่ใจ"],
                        next: { "ใช่": 11002.211021, "ไม่": 11002.211011, "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 11002.211011, type: "radio", question: "Route D Deductive Hypothesis for separable",
                        options: ["(B 1.1) Molecular nomenclatures-1", "(B 1.2) Molecular nomenclatures-2"],
                        next: { "(B 1.1) Molecular nomenclatures-1": 11002.211012, "(B 1.2) Molecular nomenclatures-2": 11002.211014 }
                    },
                    {
                        id: 11002.211012, type: "radio", question: "Draw molecular cascade - 1",
                        options: ["ใช่", "ไม่แน่ใจ"],
                        next: { "ใช่": 11002.211013, "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 11002.211013, type: "radio", question: "Identify the originated cell",
                        options: ["ใช่", "ไม่แน่ใจ"],
                        next: { "ใช่": 11002.2229, "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 11002.211014, type: "radio", question: "Draw molecular cascade - 2",
                        options: ["ใช่", "ไม่แน่ใจ"],
                        next: { "ใช่": 11002.211015, "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 11002.211015, type: "radio", question: "Identify the originated cell",
                        options: ["ใช่", "ไม่แน่ใจ"],
                        next: { "ใช่": 11002.2229, "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 11002.211021, type: "radio", question: "Route C Existing diagnosis",
                        options: ["ใช่", "ไม่แน่ใจ"],
                        next: { "ใช่": 11002.211022, "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 11002.211022, type: "radio", question: "Draw cascade",
                        options: ["ใช่", "ไม่แน่ใจ"],
                        next: { "ใช่": 11002.211023, "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 11002.211023, type: "radio", question: "Identified the originated cell",
                        options: ["ใช่", "ไม่แน่ใจ"],
                        next: { "ใช่": 11002.2229, "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 11002.2229, type: "radio", question: "(2.2.2.2) Match the intervention to signal or receptor of expression",
                        options: ["ใช่", "ไม่", "ไม่แน่ใจ"],
                        next: { "ใช่": 11002.22291, "ไม่": 11002.22292, "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 11002.22291, type: "radio", question: "Sustainable normalization of the originated cell",
                        options: ["Remission", "Controlling", "ไม่แน่ใจ"],
                        next: { "Remission": 123, "Controlling": 11002.222911, "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 123, type: "radio", question: "Remission",
                        options: ["ใช่", "ไม่แน่ใจ"],
                        next: { "ใช่": "finalResult", "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 11002.222911, type: "radio", question: "Controlling",
                        options: ["ใช่", "ไม่แน่ใจ"],
                        next: { "ใช่": "finalResult", "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 11002.22292, type: "radio", question: "Match to any section of the molecular cascade",
                        options: ["ใช่", "ไม่", "ไม่แน่ใจ"],
                        next: { "ใช่": 88, "ไม่": 11002.222921, "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 88, type: "radio", question: "Match to Symptomatic treatment for the molecular cascade reacted to clinical sign or a symptom",
                        options: ["ใช่", "ไม่แน่ใจ"],
                        next: { "ใช่": "finalResult", "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 11002.222921, type: "radio", question: "Match to Predisposing factor and prevention of predispose factor",
                        options: ["ใช่", "ไม่แน่ใจ"],
                        next: { "ใช่": "finalResult", "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 11099, type: "radio", question: "80% Remission within primary end point time frame",
                        options: ["ใช่", "ไม่แน่ใจ"],
                        next: { "ใช่": "finalResult", "ไม่แน่ใจ": "preResult" }
                    }
                ]
            }
        ]
    }
];
