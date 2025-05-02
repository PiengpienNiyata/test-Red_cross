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
                        options: ["Yes", "Uncertain"],
                        next: { "Yes": 11002, "Uncertain": "preResult" }
                    },
                    {
                        id: 11002, type: "radio", question: "2) Effectiveness of the intervention reach 80% within the primary endpoint time",
                        options: ["Yes", "No", "Uncertain"],
                        next: { "Yes": 11002.1, "No": 11002.2, "Uncertain": "preResult" }
                    },
                    {
                        id: 11002.1, type: "radio", question: "2.1) Remission when cause of the irregularity no longer exists",
                        options: ["Yes", "No", "Uncertain"],
                        next: { "Yes": 11002.11, "No": 11002.2, "Uncertain": "preResult" }
                    },
                    {
                        id: 11002.11, type: "radio", question: "2.1.1) Precision to the originated cell for a selective group pilot",
                        options: ["Yes", "Uncertain"],
                        next: { "Yes": 11002.12, "Uncertain": "preResult" }
                    },
                    {
                        id: 11002.12, type: "radio", question: "2.1.2) Match to what to do further in the E-book",
                        options: ["Yes", "Uncertain"],
                        next: { "Yes": 11002.13, "Uncertain": "preResult" }
                    },
                    {
                        id: 11002.13, type: "radio", question: "2.1.3) Confirm by full-scale study",
                        options: ["Yes", "Uncertain"],
                        next: { "Yes": 11002.14, "Uncertain": "preResult" }
                    },
                    {
                        id: 11002.14, type: "radio", question: "2.1.4) Precision intervention",
                        options: ["Yes", "Uncertain"],
                        next: { "Yes": 11099, "Uncertain": "preResult" }
                    },
                    //end of precision invention route A

                    {
                        id: 11002.2, type: "radio", question: "2.2) A cell or cells probable to be responsible the expression of symptom or sign of the irregularities",
                        options: ["Yes", "Uncertain"],
                        next: { "Yes": 11002.21, "Uncertain": "preResult" }
                    },
                    {
                        id: 11002.21, type: "radio", question: "2.2.1) Several expressing cell/s",
                        options: ["Yes", "No", "Uncertain"],
                        next: { "Yes": 110022.210, "No": 11002.22, "Uncertain": "preResult" }
                    },
                    
                    //Route B
                    {
                        id: 11002.22, type: "radio", question: "2.2.2) Solely induce sign of irregularities by a signal cell",
                        options: ["Yes", "Uncertain"],
                        next: { "Yes": 11002.221, "Uncertain": "preResult" }
                    },
                    {
                        id: 11002.221, type: "radio", question: "2.2.2.1) Originated cell",
                        options: ["Yes", "Uncertain"],
                        next: { "Yes": 11002.222, "Uncertain": "preResult" }
                    },
                    {
                        id: 11002.222, type: "radio", question: "2.2.2.2) Match to signal or receptor if expressing",
                        options: ["Yes", "Uncertain"],
                        next: { "Yes": 11002.223, "Uncertain": "preResult" }
                    },
                    {
                        id: 11002.223, type: "radio", question: "2.2.2.1) Intervention",
                        options: ["Yes", "Uncertain"],
                        next: { "Yes": 11002.224, "Uncertain": "preResult" }
                    },
                    
                    //** */
                    {
                        id: 11002.224, type: "radio", question: "Sustainable normalization the originate cell",
                        options: ["Yes", "No", "Uncertain"],
                        next: { "Yes": 11002.226, "No": 11002.225, "Uncertain": "preResult" }
                    },
                    {
                        id: 11002.225, type: "radio", question: "Controller cell",
                        options: ["Yes", "Uncertain"],
                        next: { "Yes": "finalResult", "Uncertain": "preResult" }
                    },
                    {
                        id: 11002.226, type: "radio", question: "(2.2.2.2) Remission",
                        options: ["Yes", "Uncertain"],
                        next: { "Yes": 11099, "Uncertain": "preResult" }
                    },
                    //end of route B

                    //A2.2.1
                    {
                        id: 110022.210, type: "radio", question: "(A) Match to existing clinical diagnosis in the E-book to category of the mechanism of pathogenesis",
                        options: ["Yes", "Uncertain"],
                        next: { "Yes": 11002.2101, "Uncertain": "preResult" }
                    },
                    {
                        id: 11002.2101, type: "radio", question: "Type**",
                        options: ["Yes", "No", "Uncertain"],
                        next: { "Yes": 11002.2102, "No": 11002.2110, "Uncertain": "preResult" }
                    },
                    {
                        id: 11002.2102, type: "radio", question: "Draw cascade",
                        options: ["Yes", "Uncertain"],
                        next: { "Yes": 11002.21025, "Uncertain": "preResult" }
                    },
                    {
                        id: 11002.21025, type: "radio", question: "Identify the originated cell and expression cell each typed** and each stage*",
                        options: ["Set Combination of intervention of originated cell and a stage* and designed typed** depended to the purposed", "Set Combination of intervention of Another stage* and typed** depended the purposed", "Uncertain"],
                        next: { "Set Combination of intervention of originated cell and a stage* and designed typed** depended to the purposed": 11002.2103, "Set Combination of intervention of Another stage* and typed** depended the purposed": 11002.2104, "Uncertain": "preResult" }
                    },
                    {
                        id: 11002.2103, type: "radio", question: "Set Combination of intervention of originated cell and a stage* and designed typed** depended to the purposed",
                        options: ["Yes", "Uncertain"],
                        next: { "Yes": 11002.2105, "Uncertain": "preResult" }
                    },
                    {
                        id: 11002.2104, type: "radio", question: "Set Combination of intervention of Another stage* and typed** depended the purposed",
                        options: ["Yes", "Uncertain"],
                        next: { "Yes": 11002.2105, "Uncertain": "preResult" }
                    },
                    {
                        id: 11002.2105, type: "radio", question: "Set signal intervention",
                        options: ["Yes", "Uncertain"],
                        next: { "Yes": 11002.2106, "Uncertain": "preResult" }
                    },
                    {
                        id: 11002.2106, type: "radio", question: "80% of the amount a sign or symptom of a type** is clear in a set of time frame that meet satisfaction (expectation)",
                        options: ["Yes", "Uncertain"],
                        next: { "Yes": 11099, "Uncertain": "preResult" }
                    },
                    {
                        id: 11002.2110, type: "radio", question: "(A 2.2.1) Stage*",
                        options: ["Yes", "No", "Uncertain"],
                        next: { "Yes": 11002.2111, "No": 11002.21101, "Uncertain": "preResult" }
                    },
                    {
                        id: 11002.2111, type: "radio", question: "Draw cascade",
                        options: ["Yes", "Uncertain"],
                        next: { "Yes": 11002.2112, "Uncertain": "preResult" }
                    },
                    {
                        id: 11002.2112, type: "radio", question: "Identified the originated cell and expression cell",
                        options: ["Stage 1", "Stage 2"],
                        next: { "Stage 1": 11002.2113, "Stage 2": 11002.2115, "Uncertain": "preResult" }
                    },
                    {
                        id: 11002.2113, type: "radio", question: "Stage 1*",
                        options: ["Yes", "Uncertain"],
                        next: { "Yes": 11002.2114, "Uncertain": "preResult" }
                    },
                    {
                        id: 11002.2114, type: "radio", question: "Combination of intervention of originated cell and expressing cell of a stage* cascade",
                        options: ["Yes", "Uncertain"],
                        next: { "Yes": 11002.2229, "Uncertain": "preResult" }
                    },
                    {
                        id: 11002.2115, type: "radio", question: "Stage 2*",
                        options: ["Yes", "Uncertain"],
                        next: { "Yes": 11002.2116, "Uncertain": "preResult" }
                    },
                    {
                        id: 11002.2116, type: "radio", question: "Combination of intervention of originated cell and expressing cell of another stage 2 cascade",
                        options: ["Yes", "Uncertain"],
                        next: { "Yes": 11002.2229, "Uncertain": "preResult" }
                    },
                    {
                        id: 11002.21101, type: "radio", question: "(B) Evidently explainable of obvious contrast in irregularity natural courses",
                        options: ["Yes", "No", "Uncertain"],
                        next: { "Yes": 11002.211021, "No": 11002.211011, "Uncertain": "preResult" }
                    },
                    {
                        id: 11002.211011, type: "radio", question: "Deductive Hypothesis for separable",
                        options: ["(B 1.1) Molecular nomenclatures-1", "(B 1.2) Molecular nomenclatures-2"],
                        next: { "(B 1.1) Molecular nomenclatures-1": 11002.211012, "(B 1.2) Molecular nomenclatures-2": 11002.211014 }
                    },
                    {
                        id: 11002.211012, type: "radio", question: "Draw molecular cascade - 1",
                        options: ["Yes", "Uncertain"],
                        next: { "Yes": 11002.211013, "Uncertain": "preResult" }
                    },
                    {
                        id: 11002.211013, type: "radio", question: "Identify the originated cell",
                        options: ["Yes", "Uncertain"],
                        next: { "Yes": 11002.2229, "Uncertain": "preResult" }
                    },
                    {
                        id: 11002.211014, type: "radio", question: "Draw molecular cascade - 2",
                        options: ["Yes", "Uncertain"],
                        next: { "Yes": 11002.211015, "Uncertain": "preResult" }
                    },
                    {
                        id: 11002.211015, type: "radio", question: "Identify the originated cell",
                        options: ["Yes", "Uncertain"],
                        next: { "Yes": 11002.2229, "Uncertain": "preResult" }
                    },
                    {
                        id: 11002.211021, type: "radio", question: "Existing diagnosis",
                        options: ["Yes", "Uncertain"],
                        next: { "Yes": 11002.211022, "Uncertain": "preResult" }
                    },
                    {
                        id: 11002.211022, type: "radio", question: "Draw cascade",
                        options: ["Yes", "Uncertain"],
                        next: { "Yes": 11002.211023, "Uncertain": "preResult" }
                    },
                    {
                        id: 11002.211023, type: "radio", question: "Identified the originated cell",
                        options: ["Yes", "Uncertain"],
                        next: { "Yes": 11002.2229, "Uncertain": "preResult" }
                    },
                    {
                        id: 11002.2229, type: "radio", question: "(2.2.2.2) Match the intervention to signal or receptor of expression",
                        options: ["Yes", "No", "Uncertain"],
                        next: { "Yes": 11002.22291, "No": 11002.22292, "Uncertain": "preResult" }
                    },
                    {
                        id: 11002.22291, type: "radio", question: "Sustainable normalization of the originated cell",
                        options: ["Remission", "Controlling", "Uncertain"],
                        next: { "Remission": 123, "Controlling": 11002.222911, "Uncertain": "preResult" }
                    },
                    {
                        id: 123, type: "radio", question: "Remission",
                        options: ["Yes", "Uncertain"],
                        next: { "Yes": "finalResult", "Uncertain": "preResult" }
                    },
                    {
                        id: 11002.222911, type: "radio", question: "Controlling",
                        options: ["Yes", "Uncertain"],
                        next: { "Yes": "finalResult", "Uncertain": "preResult" }
                    },
                    {
                        id: 11002.22292, type: "radio", question: "Match to any section of the molecular cascade",
                        options: ["Yes", "No", "Uncertain"],
                        next: { "Yes": 88, "No": 11002.222921, "Uncertain": "preResult" }
                    },
                    {
                        id: 88, type: "radio", question: "Match to Symptomatic treatment for the molecular cascade reacted to clinical sign or a symptom",
                        options: ["Yes", "Uncertain"],
                        next: { "Yes": "finalResult", "Uncertain": "preResult" }
                    },
                    {
                        id: 11002.222921, type: "radio", question: "Match to Predisposing factor and prevention of predispose factor",
                        options: ["Yes", "Uncertain"],
                        next: { "Yes": "finalResult", "Uncertain": "preResult" }
                    },
                    {
                        id: 11099, type: "radio", question: "80% Remission within primary end point time frame",
                        options: ["Yes", "Uncertain"],
                        next: { "Yes": "finalResult", "Uncertain": "preResult" }
                    }
                ]
            }
        ]
    }
];
