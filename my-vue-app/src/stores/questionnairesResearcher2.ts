// /* 2 */

// export interface Questionnaire2 {
//     title: string;
//     sections: Section2[];
// }

// export interface Section2 {
//     name: string;
//     questions: Question2[];
// }

// export interface Question2 {
//     id: number;
//     type: "text" | "radio" | "checkbox";
//     question: string;
//     options?: string[];
// }

// export const questionnaireData: Questionnaire2[] = [
//     {
//         title: "Road map to explore the precision intervention",
//         sections: [
//             {
//                 name: "null",
//                 questions: [
//                     {
//                         id: 1, type: "radio", question: "1) Assessment of initiated intervention for a certain disease of more than (selected) pilot 30 subjects",
//                         options: ["ใช่", "ไม่แน่ใจ"]
//                     },
//                     {
//                         id: 2, type: "radio", question: "2) Effectiveness of the intervention reach 80% with in the primary endpoint time",
//                         options: ["ใช่", "ไม่", "ไม่แน่ใจ"]
//                     },
//                     {
//                         id: 2.1, type: "radio", question: "2.1) Remission when cause of the irregularity no longer exit",
//                         options: ["ใช่", "ไม่", "ไม่แน่ใจ"]
//                     },
//                     {
//                         id: 2.11, type: "radio", question: "2.1.1) Precision to the originated cell for a selective group pilot",
//                         options: ["ใช่", "ไม่แน่ใจ"]
//                     },
//                     {
//                         id: 2.12, type: "radio", question: "2.1.2) Match to what to do further in the E-book",
//                         options: ["ใช่", "ไม่แน่ใจ"]
//                     },
//                     {
//                         id: 2.13, type: "radio", question: "2.1.3) Confirm by full scale study",
//                         options: ["ใช่", "ไม่แน่ใจ"]
//                     },
//                     {
//                         id: 2.14, type: "radio", question: "2.1.4) Precision intervention",
//                         options: ["ใช่", "ไม่แน่ใจ"]
//                     },//end
//                     {
//                         id: 2.2, type: "radio", question: "2.2) A cell or cells probable to be responsible the expression of symptom or sign of the irregularities",
//                         options: ["ใช่", "ไม่แน่ใจ"]
//                     },
//                     {
//                         id: 2.21, type: "radio", question: "(2.2.1) Several expressing cell/s",
//                         options: ["ใช่", "ไม่", "ไม่แน่ใจ"]
//                     },
//                     {
//                         id: 2.22, type: "radio", question: "Route B (2.2.2) Solely induce sign of irregularities by a signal cell",
//                         options: ["ใช่", "ไม่แน่ใจ"]
//                     },
//                     {
//                         id: 2.221, type: "radio", question: "(2.2.2.1) Originated cell",
//                         options: ["ใช่", "ไม่แน่ใจ"]
//                     },
//                     {
//                         id: 2.222, type: "radio", question: "(2.2.2.2) Match to signal or receptor if expressing",
//                         options: ["ใช่", "ไม่แน่ใจ"]
//                     },
//                     {
//                         id: 2.223, type: "radio", question: "(2.2.2.1) Intervention",
//                         options: ["ใช่", "ไม่แน่ใจ"]
//                     },

//                     {
//                         id: 2.224, type: "radio", question: "Sustainable normalization the originate cell",
//                         options: ["ใช่", "ไม่", "ไม่แน่ใจ"]
//                     },
//                     {
//                         id: 2.225, type: "radio", question: "Controller cell",

//                     },//end
//                     {
//                         id: 2.226, type: "radio", question: "(2.2.2.2) Remission",
//                         options: ["ใช่", "ไม่แน่ใจ"]
//                     },//end
                    
//                     {
//                         id: 2.210, type: "radio", question: "(A) Match to existing clinical diagnosis in the E-bookto category of the mechanism of pathogenesis",
//                         options: ["ใช่", "ไม่แน่ใจ"]
//                     }, {
//                         id: 2.2101, type: "radio", question: "Type**",
//                         options: ["ใช่", "ไม่", "ไม่แน่ใจ"]
//                     }, {
//                         id: 2.2102, type: "radio", question: "Draw cascade",
//                         options: ["ใช่", "ไม่แน่ใจ"]
//                     }, {
//                         id: 2.2103, type: "radio", question: "Route G Set Combination of intervention of originated cell and a stage*anddesigned typed**depended to the purposed",
//                         options: ["ใช่", "ไม่แน่ใจ"]
//                     }, {
//                         id: 2.2104, type: "radio", question: "Route H Set Combination of intervention of Another stage*and typed**depended the purposed",
//                         options: ["ใช่", "ไม่แน่ใจ"]
//                     }, {
//                         id: 2.2105, type: "radio", question: "Set signal intervention",
//                         options: ["ใช่", "ไม่แน่ใจ"]
//                     }, {
//                         id: 2.2106, type: "radio", question: "80% of the amount a sign or symptom of a type**is clear in a set of time frame that meet satisfaction(expectation)",
//                         options: ["ใช่", "ไม่แน่ใจ"]
//                     }, {
//                         id: 2.2110, type: "radio", question: "(A 2.2.1) Stage*",
//                         options: ["ใช่", "ไม่", "ไม่แน่ใจ"]
//                     }, {
//                         id: 2.2111, type: "radio", question: "Draw cascade",
//                         options: ["ใช่", "ไม่แน่ใจ"]
//                     }, {
//                         id: 2.2112, type: "radio", question: "Identified the originated cell and expression cell ",
//                         options: ["ใช่", "ไม่แน่ใจ"]
//                     }, {
//                         id: 2.2113, type: "radio", question: "Stage 1*",
//                         options: ["ใช่", "ไม่แน่ใจ"]
//                     }, {
//                         id: 2.2114, type: "radio", question: "Route E Combination of intervention of originated cell and expressing cell of a stage* cascade",
//                         options: ["ใช่", "ไม่แน่ใจ"]
//                     }, {
//                         id: 2.2115, type: "radio", question: "Stage 2*",
//                         options: ["ใช่", "ไม่แน่ใจ"]
//                     }, {
//                         id: 2.2116, type: "radio", question: "Route F Combination of interventionof originated cell and expressingcell of another stage 2 cascade",
//                         options: ["ใช่", "ไม่แน่ใจ"]
//                     },{
//                         id: 2.21101, type: "radio", question: "(B) Evidently explainable of obvious contrast in irregularity natural courses",
//                         options: ["ใช่", "ไม่", "ไม่แน่ใจ"]
//                     },
//                     {
//                         id: 2.211011, type: "radio", question: "Route D Deductive Hypothesis for separable",
//                         options: ["(B 1.1) Molecular nomenclatures-1", "(B 1.2) Molecular nomenclatures-2"]
//                     },//******* */
//                     {
//                         id: 2.211012, type: "radio", question: "Draw molecular cascade - 1",
//                         options: ["ใช่", "ไม่แน่ใจ"]
//                     },
//                     {
//                         id: 2.211013, type: "radio", question: "Identify the originated cell",
//                         options: ["ใช่", "ไม่แน่ใจ"]
//                     },
//                     {
//                         id: 2.211014, type: "radio", question: "Draw molecular cascade -2",
//                         options: ["ใช่", "ไม่แน่ใจ"]
//                     },
//                     {
//                         id: 2.211015, type: "radio", question: "Identify the originated cell",
//                         options: ["ใช่", "ไม่แน่ใจ"]
//                     },
//                     {
//                         id: 2.211021, type: "radio", question: "Route C Existing diagnosis",
//                         options: ["ใช่", "ไม่แน่ใจ"]
//                     },
//                     {
//                         id: 2.211022, type: "radio", question: "Draw cascade",
//                         options: ["ใช่", "ไม่แน่ใจ"]
//                     },
//                     {
//                         id: 2.211023, type: "radio", question: "Identified the originated cell",
//                         options: ["ใช่", "ไม่แน่ใจ"]
//                     },//end

//                     {
//                         id: 2.2229, type: "radio", question: "(2.2.2.2) Match the intervention to signal or receptor of expression",
//                         options: ["ใช่", "ไม่", "ไม่แน่ใจ"]
//                     },
//                     {
//                         id: 2.22291, type: "radio", question: "Sustainable normalization of the originated cell",
//                         options: ["ใช่", "ไม่", "ไม่แน่ใจ"]
//                     },
//                     {
//                         id: 2.222910, type: "radio", question: "Remission",
//                     },//end
//                     {
//                         id: 2.222911, type: "radio", question: "Controlling",
//                     },//end

//                     {
//                         id: 2.22292, type: "radio", question: "Match to any section of the molecular cascade",
//                         options: ["ใช่", "ไม่", "ไม่แน่ใจ"]
//                     },
//                     {
//                         id: 2.222920, type: "radio", question: "Match to Symptomatic treatment for the molecular a cascade reacted to clinical sign or a symptom",
//                     },//end
//                     {
//                         id: 2.222921, type: "radio", question: "Match to Predisposing factor and prevention of predispose factor",
//                     },//end


//                     {
//                         id: 99, type: "radio", question: "80% Remission with in primary end point time frame",
//                     },

//                 ]
//             },

//         ]
//     }
// ];

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
    next?: Record<string, number | "preResult" | "finalResult">;
}

export const questionnaireData: Questionnaire2[] = [
    {
        title: "Road map to explore the precision intervention",
        sections: [
            {
                name: "null",
                questions: [
                    //precision invention route A
                    {
                        id: 1, type: "radio", question: "1) Assessment of initiated intervention for a certain disease of more than (selected) pilot 30 subjects",
                        options: ["ใช่", "ไม่แน่ใจ"],
                        next: { "ใช่": 2, "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 2, type: "radio", question: "2) Effectiveness of the intervention reach 80% within the primary endpoint time",
                        options: ["ใช่", "ไม่", "ไม่แน่ใจ"],
                        next: { "ใช่": 2.1, "ไม่": 2.2, "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 2.1, type: "radio", question: "2.1) Remission when cause of the irregularity no longer exists",
                        options: ["ใช่", "ไม่", "ไม่แน่ใจ"],
                        next: { "ใช่": 2.11, "ไม่": 2.2, "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 2.11, type: "radio", question: "2.1.1) Precision to the originated cell for a selective group pilot",
                        options: ["ใช่", "ไม่แน่ใจ"],
                        next: { "ใช่": 2.12, "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 2.12, type: "radio", question: "2.1.2) Match to what to do further in the E-book",
                        options: ["ใช่", "ไม่แน่ใจ"],
                        next: { "ใช่": 2.13, "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 2.13, type: "radio", question: "2.1.3) Confirm by full-scale study",
                        options: ["ใช่", "ไม่แน่ใจ"],
                        next: { "ใช่": 2.14, "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 2.14, type: "radio", question: "2.1.4) Precision intervention",
                        options: ["ใช่", "ไม่แน่ใจ"],
                        next: { "ใช่": 99, "ไม่แน่ใจ": "preResult" }
                    },
                    //end of precision invention route A

                    {
                        id: 2.2, type: "radio", question: "2.2) A cell or cells probable to be responsible the expression of symptom or sign of the irregularities",
                        options: ["ใช่", "ไม่แน่ใจ"],
                        next: { "ใช่": 2.21, "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 2.21, type: "radio", question: "2.2.1) Several expressing cell/s",
                        options: ["ใช่", "ไม่", "ไม่แน่ใจ"],
                        next: { "ใช่": 22.210, "ไม่": 2.22, "ไม่แน่ใจ": "preResult" }
                    },
                    
                    //Route B
                    {
                        id: 2.22, type: "radio", question: "Route B (2.2.2) Solely induce sign of irregularities by a signal cell",
                        options: ["ใช่", "ไม่แน่ใจ"],
                        next: { "ใช่": 2.221, "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 2.221, type: "radio", question: "2.2.2.1) Originated cell",
                        options: ["ใช่", "ไม่แน่ใจ"],
                        next: { "ใช่": 2.222, "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 2.222, type: "radio", question: "2.2.2.2) Match to signal or receptor if expressing",
                        options: ["ใช่", "ไม่แน่ใจ"],
                        next: { "ใช่": 2.223, "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 2.223, type: "radio", question: "2.2.2.1) Intervention",
                        options: ["ใช่", "ไม่แน่ใจ"],
                        next: { "ใช่": 2.224, "ไม่แน่ใจ": "preResult" }
                    },
                    
                    //** */
                    {
                        id: 2.224, type: "radio", question: "Sustainable normalization the originate cell",
                        options: ["ใช่", "ไม่", "ไม่แน่ใจ"],
                        next: { "ใช่": 2.226, "ไม่": 2.225, "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 2.225, type: "radio", question: "Controller cell",
                        options: ["ใช่", "ไม่แน่ใจ"],
                        next: { "ใช่": "finalResult", "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 2.226, type: "radio", question: "(2.2.2.2) Remission",
                        options: ["ใช่", "ไม่แน่ใจ"],
                        next: { "ใช่": 99, "ไม่แน่ใจ": "preResult" }
                    },
                    //end of route B

                    //A2.2.1
                    {
                        id: 22.210, type: "radio", question: "(A) Match to existing clinical diagnosis in the E-book to category of the mechanism of pathogenesis",
                        options: ["ใช่", "ไม่แน่ใจ"],
                        next: { "ใช่": 2.2101, "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 2.2101, type: "radio", question: "Type**",
                        options: ["ใช่", "ไม่", "ไม่แน่ใจ"],
                        next: { "ใช่": 2.2102, "ไม่": 2.2110, "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 2.2102, type: "radio", question: "Draw cascade",
                        options: ["ใช่", "ไม่แน่ใจ"],
                        next: { "ใช่": 2.21025, "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 2.21025, type: "radio", question: "Identify the originated cell and expression cell each typed** and each stage*",
                        options: ["Route G", "Route H", "ไม่แน่ใจ"],
                        next: { "Route G": 2.2103, "Route H": 2.2104, "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 2.2103, type: "radio", question: "Route G Set Combination of intervention of originated cell and a stage* and designed typed** depended to the purposed",
                        options: ["ใช่", "ไม่แน่ใจ"],
                        next: { "ใช่": 2.2105, "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 2.2104, type: "radio", question: "Route H Set Combination of intervention of Another stage* and typed** depended the purposed",
                        options: ["ใช่", "ไม่แน่ใจ"],
                        next: { "ใช่": 2.2105, "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 2.2105, type: "radio", question: "Set signal intervention",
                        options: ["ใช่", "ไม่แน่ใจ"],
                        next: { "ใช่": 2.2106, "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 2.2106, type: "radio", question: "80% of the amount a sign or symptom of a type** is clear in a set of time frame that meet satisfaction (expectation)",
                        options: ["ใช่", "ไม่แน่ใจ"],
                        next: { "ใช่": 99, "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 2.2110, type: "radio", question: "(A 2.2.1) Stage*",
                        options: ["ใช่", "ไม่", "ไม่แน่ใจ"],
                        next: { "ใช่": 2.2111, "ไม่": 2.21101, "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 2.2111, type: "radio", question: "Draw cascade",
                        options: ["ใช่", "ไม่แน่ใจ"],
                        next: { "ใช่": 2.2112, "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 2.2112, type: "radio", question: "Identified the originated cell and expression cell",
                        options: ["Stage 1", "Stage 2"],
                        next: { "Stage 1": 2.2113, "Stage 2": 2.2115, "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 2.2113, type: "radio", question: "Stage 1*",
                        options: ["ใช่", "ไม่แน่ใจ"],
                        next: { "ใช่": 2.2114, "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 2.2114, type: "radio", question: "Route E Combination of intervention of originated cell and expressing cell of a stage* cascade",
                        options: ["ใช่", "ไม่แน่ใจ"],
                        next: { "ใช่": 2.2229, "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 2.2115, type: "radio", question: "Stage 2*",
                        options: ["ใช่", "ไม่แน่ใจ"],
                        next: { "ใช่": 2.2116, "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 2.2116, type: "radio", question: "Route F Combination of intervention of originated cell and expressing cell of another stage 2 cascade",
                        options: ["ใช่", "ไม่แน่ใจ"],
                        next: { "ใช่": 2.2229, "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 2.21101, type: "radio", question: "(B) Evidently explainable of obvious contrast in irregularity natural courses",
                        options: ["ใช่", "ไม่", "ไม่แน่ใจ"],
                        next: { "ใช่": 2.211021, "ไม่": 2.211011, "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 2.211011, type: "radio", question: "Route D Deductive Hypothesis for separable",
                        options: ["(B 1.1) Molecular nomenclatures-1", "(B 1.2) Molecular nomenclatures-2"],
                        next: { "(B 1.1) Molecular nomenclatures-1": 2.211012, "(B 1.2) Molecular nomenclatures-2": 2.211014 }
                    },
                    {
                        id: 2.211012, type: "radio", question: "Draw molecular cascade - 1",
                        options: ["ใช่", "ไม่แน่ใจ"],
                        next: { "ใช่": 2.211013, "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 2.211013, type: "radio", question: "Identify the originated cell",
                        options: ["ใช่", "ไม่แน่ใจ"],
                        next: { "ใช่": 2.2229, "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 2.211014, type: "radio", question: "Draw molecular cascade - 2",
                        options: ["ใช่", "ไม่แน่ใจ"],
                        next: { "ใช่": 2.211015, "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 2.211015, type: "radio", question: "Identify the originated cell",
                        options: ["ใช่", "ไม่แน่ใจ"],
                        next: { "ใช่": 2.2229, "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 2.211021, type: "radio", question: "Route C Existing diagnosis",
                        options: ["ใช่", "ไม่แน่ใจ"],
                        next: { "ใช่": 2.211022, "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 2.211022, type: "radio", question: "Draw cascade",
                        options: ["ใช่", "ไม่แน่ใจ"],
                        next: { "ใช่": 2.211023, "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 2.211023, type: "radio", question: "Identified the originated cell",
                        options: ["ใช่", "ไม่แน่ใจ"],
                        next: { "ใช่": "finalResult", "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 2.2229, type: "radio", question: "(2.2.2.2) Match the intervention to signal or receptor of expression",
                        options: ["ใช่", "ไม่", "ไม่แน่ใจ"],
                        next: { "ใช่": 2.22291, "ไม่": 2.22292, "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 2.22291, type: "radio", question: "Sustainable normalization of the originated cell",
                        options: ["Remission", "Controlling", "ไม่แน่ใจ"],
                        next: { "Remission": 2.222910, "Controlling": 2.222911, "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 2.222910, type: "radio", question: "Remission",
                        options: ["ใช่", "ไม่แน่ใจ"],
                        next: { "ใช่": "finalResult", "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 2.222911, type: "radio", question: "Controlling",
                        options: ["ใช่", "ไม่แน่ใจ"],
                        next: { "ใช่": "finalResult", "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 2.22292, type: "radio", question: "Match to any section of the molecular cascade",
                        options: ["ใช่", "ไม่", "ไม่แน่ใจ"],
                        next: { "ใช่": 2.222920, "ไม่": 2.222921, "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 2.222920, type: "radio", question: "Match to Symptomatic treatment for the molecular cascade reacted to clinical sign or a symptom",
                        options: ["ใช่", "ไม่แน่ใจ"],
                        next: { "ใช่": "finalResult", "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 2.222921, type: "radio", question: "Match to Predisposing factor and prevention of predispose factor",
                        options: ["ใช่", "ไม่แน่ใจ"],
                        next: { "ใช่": "finalResult", "ไม่แน่ใจ": "preResult" }
                    },
                    {
                        id: 99, type: "radio", question: "80% Remission within primary end point time frame",
                        options: ["ใช่", "ไม่แน่ใจ"],
                        next: { "ใช่": "finalResult", "ไม่แน่ใจ": "preResult" }
                    }
                ]
            }
        ]
    }
];
