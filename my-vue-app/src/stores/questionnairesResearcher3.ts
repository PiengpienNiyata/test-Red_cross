//ทำในไฟล์นี้
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
                        id: 100, type: "radio", question: "Have studying disease",
                        options: ["Yes", "No", "Uncertain"],
                        next: { "Yes": 101, "No": 104, "Uncertain": "preResult" }
                    },
                    {
                        id: 101, type: "radio", question: "Have staging",
                        options: ["Yes", "No", "Uncertain"],
                        next: { "Yes": 102, "No": 104, "Uncertain": "preResult" }
                    },
                    {
                        id: 102, type: "radio", question: "Have typing",
                        options: ["Yes", "No", "Uncertain"],
                        next: { "Yes": 103, "No": 104, "Uncertain": "preResult" }
                    },
                    {
                        id: 103, type: "radio", question: "Disease assessment without remission studying result",
                        options: ["Yes", "Uncertain"],
                        next: { "Yes": 109, "Uncertain": "preResult" }
                    },
                    {
                        id: 104, type: "radio", question: "Assessment of initiated intervention for a certain disease of more than (selected) pilot 30 subjects",
                        options: ["Yes", "No", "Uncertain"],
                        next: { "Yes": 105, "No": 103, "Uncertain": "preResult" }
                    },
                    {
                        id: 105, type: "radio", question: "Presumptive intervention evidence of remission at 80% of the case from independent institute",
                        options: ["Yes", "No", "Uncertain"],
                        next: { "Yes": 106, "No": 103, "Uncertain": "preResult" }
                    },
                    {
                        id: 106, type: "radio", question: "Remnant of sign or symptom",
                        options: ["Yes", "No", "Uncertain"],
                        next: { "Yes": 107, "No": 108, "Uncertain": "preResult" }
                    },
                    {
                        id: 107, type: "radio", question: "Symptomatic treatment",
                        options: ["Yes", "Uncertain"],
                        next: { "Yes": 109, "Uncertain": "preResult" }
                    },
                    {
                        id: 108, type: "radio", question: "Draw the molecular cascade of the disease to identify the originating cell which being confirmed by cross checking with the molecular data of the initiated intervention",
                        options: ["Yes", "Uncertain"],
                        next: { "Yes": 110, "Uncertain": "preResult" }
                    },
                    //109 อยู่ล่างๆ
                    {
                        id: 110, type: "radio", question: "Identify the source of signal that induces the disease development",
                        options: ["Yes", "Uncertain"],
                        next: { "Yes": 111, "Uncertain": "preResult" }
                    },
                    {
                        id: 111, type: "radio", question: "Do not require research question before conduct the traditional research to confirm the rate of remission",
                        options: ["Yes", "Uncertain"],
                        next: { "Yes": "finalResult", "Uncertain": "preResult" }
                    },

                    /* {
                        id: 11002, type: "radio", question: "2) Effectiveness of the intervention reach 80% within the primary endpoint time",
                        options: ["Yes", "No", "Uncertain"],
                        next: { "Yes": 11002.1, "No": -, "Uncertain": "preResult" }
                    },
                    {
                        id: 11002.1, type: "radio", question: "2.1) Remission when cause of the irregularity no longer exists",
                        options: ["Yes", "No", "Uncertain"],
                        next: { "Yes": 11002.11, "No": -, "Uncertain": "preResult" }
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
                    //end of precision invention route A */

                    {
                        id: 109, type: "radio", question: "2.2) A cell or cells probable to be responsible the expression of symptom or sign of the irregularities",
                        options: ["Yes", "Uncertain"],
                        next: { "Yes": 112, "Uncertain": "preResult" }
                    },
                    {
                        id: 112, type: "radio", question: "2.2.1) Several expressing cell/s",
                        options: ["Yes", "No", "Uncertain"],
                        next: { "Yes": 113, "No": 1121, "Uncertain": "preResult" }
                    },
                    
                    //Route B
                    {
                        id: 1121, type: "radio", question: "2.2.2) Solely induce sign of irregularities by a signal cell",
                        options: ["Yes", "Uncertain"],
                        next: { "Yes": 1122, "Uncertain": "preResult" }
                    },
                    {
                        id: 1122, type: "radio", question: "2.2.2.1) Originated cell",
                        options: ["Yes", "Uncertain"],
                        next: { "Yes": 1123, "Uncertain": "preResult" }
                    },
                    {
                        id: 1123, type: "radio", question: "2.2.2.2) Match to signal or receptor the group of clinical or clinical histopathogenesis",
                        options: ["Yes", "Uncertain"],
                        next: { "Yes": 1124, "Uncertain": "preResult" }
                    },
                    {
                        id: 1124, type: "radio", question: "Establish research question",
                        options: ["Yes", "Uncertain"],
                        next: { "Yes": 1125, "Uncertain": "preResult" }
                    },
                    {
                        id: 1125, type: "radio", question: "2.2.2.1) Intervention studying",
                        options: ["Yes", "Uncertain"],
                        next: { "Yes": 1126, "Uncertain": "preResult" }
                    },
                    
                    {
                        id: 1126, type: "radio", question: "Sustainable normalization the originate cell",
                        options: ["Yes", "No", "Uncertain"],
                        next: { "Yes": 1128, "No": 1127, "Uncertain": "preResult" }
                    },
                    {
                        id: 1127, type: "radio", question: "Control",
                        options: ["Yes", "Uncertain"],
                        next: { "Yes": "finalResult", "Uncertain": "preResult" }
                    },
                    {
                        id: 1128, type: "radio", question: "(2.2.2.2) Remission",
                        options: ["Yes", "Uncertain"],
                        next: { "Yes": "finalResult", "Uncertain": "preResult" }
                    },
                    //end of route B

                    //A2.2.1
                    {
                        id: 113, type: "radio", question: "(A) Evidence of sharing the molecular pathway",
                        options: ["Yes", "Uncertain"],
                        next: { "Yes": 200, "Uncertain": "preResult" }
                    },
                    {
                        id: 200, type: "radio", question: "(A 2.2.1) District molecular triggers Type**",
                        options: ["Yes", "No", "Uncertain"],
                        next: { "Yes": 210, "No": 220, "Uncertain": "preResult" }
                    },
                    {
                        id: 210, type: "radio", question: "Intervention evidence 80% subsidence of a particular sign",
                        options: ["Yes", "No", "Uncertain"],
                        next: { "Yes": 211, "No": 212, "Uncertain": "preResult" }
                    },
                    {
                        id: 211, type: "radio", question: "Set Combination of intervention of originated cell and a stage* and designed typed** depended to the purposed",
                        options: ["Yes", "Uncertain"],
                        next: { "Yes": 213, "Uncertain": "preResult" }
                    },
                    {
                        id: 212, type: "radio", question: "Set intervention study according to standard therapy of single active agent",
                        options: ["Yes", "Uncertain"],
                        next: { "Yes": 213, "Uncertain": "preResult" }
                    },
                    {
                        id: 213, type: "radio", question: "80% subsidence of any type of lesions with in primary end point time frame leading to identify the originating cell",
                        options: ["Yes", "Uncertain"],
                        next: { "Yes": 214, "Uncertain": "preResult" }
                    },
                    {
                        id: 214, type: "radio", question: "Draw clinico-molecular cascade",
                        options: ["Yes", "Uncertain"],
                        next: { "Yes": 215, "Uncertain": "preResult" }
                    },
                    {
                        id: 215, type: "radio", question: "Identify originating cell",
                        options: ["Yes", "Uncertain"],
                        next: { "Yes": 500, "Uncertain": "preResult" }
                    },
                    {
                        id: 220, type: "radio", question: "(A 2.2.1) Stage*",
                        options: ["Yes", "No", "Uncertain"],
                        next: { "Yes": 2201, "No": 230, "Uncertain": "preResult" }
                    },
                    {
                        id: 2201, type: "radio", question: "Identified the originated cell and expression cell",
                        options: ["Stage 1", "Stage 2"],
                        next: { "Stage 1": 221, "Stage 2": 222 }
                    },
                    {
                        id: 221, type: "radio", question: "Stage 1",
                        options: ["Yes", "Uncertain"],
                        next: { "Yes": 223, "Uncertain": "preResult" }
                    },
                    {
                        id: 222, type: "radio", question: "Stage 2",
                        options: ["Yes", "Uncertain"],
                        next: { "Yes": 224, "Uncertain": "preResult" }
                    },
                    {
                        id: 223, type: "radio", question: "Combination of intervention of originated cell and expressing cell of a stage* cascade",
                        options: ["Yes", "Uncertain"],
                        next: { "Yes": 225, "Uncertain": "preResult" }
                    },
                    {
                        id: 224, type: "radio", question: "Combination of intervention of originated cell and expressing cell of another stage 2 cascade",
                        options: ["Yes", "Uncertain"],
                        next: { "Yes": 225, "Uncertain": "preResult" }
                    },
                    {
                        id: 225, type: "radio", question: "Draw clinico-molecular cascade",
                        options: ["Yes", "Uncertain"],
                        next: { "Yes": 226, "Uncertain": "preResult" }
                    },
                    {
                        id: 226, type: "radio", question: "Identify originating cell",
                        options: ["Yes", "Uncertain"],
                        next: { "Yes": 500, "Uncertain": "preResult" }
                    },
                //จบรูท E/F

                    {
                        id: 230, type: "radio", question: "Evidently explainable of obvious contrast in irregularity natural courses / or typing with no evidence that they are not the same pathway",
                        options: ["Yes", "No", "Uncertain"],
                        next: { "Yes": 240, "No": 250, "Uncertain": "preResult" }
                    },
                    //รูท C
                    {
                        id: 240, type: "radio", question: "Existing diagnosis",
                        options: ["Yes", "Uncertain"],
                        next: { "Yes": 241, "Uncertain": "preResult" }
                    },
                    {
                        id: 241, type: "radio", question: "Not able to draw cascade",
                        options: ["Yes", "Uncertain"],
                        next: { "Yes": 242, "Uncertain": "preResult" }
                    },
                    {
                        id: 242, type: "radio", question: "Not able to Identified the originated cell",
                        options: ["Yes", "Uncertain"],
                        next: { "Yes": 243, "Uncertain": "preResult" }
                    },
                    {
                        id: 243, type: "radio", question: "Symptomatic treatment",
                        options: ["Yes", "Uncertain"],
                        next: { "Yes": "finalResult", "Uncertain": "preResult" }
                    },

                    //รูทD
                    {
                        id: 250, type: "radio", question: "Deductive Hypothesis for separable",
                        options: ["Molecular nomenclatures-1", "Molecular nomenclatures-2"],
                        next: { "Molecular nomenclatures-1": 251, "Molecular nomenclatures-2": 252 }
                    },
                    {
                        id: 251, type: "radio", question: "Molecular nomenclatures-1",
                        options: ["Yes", "Uncertain"],
                        next: { "Yes": 253, "Uncertain": "preResult" }
                    },
                    {
                        id: 252, type: "radio", question: "Molecular nomenclatures-2",
                        options: ["Yes", "Uncertain"],
                        next: { "Yes": 254, "Uncertain": "preResult" }
                    },
                    {
                        id: 253, type: "radio", question: "Draw molecular cascade - 1",
                        options: ["Yes", "Uncertain"],
                        next: { "Yes": 255, "Uncertain": "preResult" }
                    },
                    {
                        id: 254, type: "radio", question: "Draw molecular cascade - 2",
                        options: ["Yes", "Uncertain"],
                        next: { "Yes": 255, "Uncertain": "preResult" }
                    },
                    {
                        id: 255, type: "radio", question: "Identify the originated cell",
                        options: ["Yes", "Uncertain"],
                        next: { "Yes": 500, "Uncertain": "preResult" }
                    },
                    

                    


                    {
                        id: 500, type: "radio", question: "Establish research questions",
                        options: ["Yes", "Uncertain"],
                        next: { "Yes": 501, "Uncertain": "preResult" }
                    },
                    {
                        id: 501, type: "radio", question: "Intervention study",
                        options: ["Yes", "Uncertain"],
                        next: { "Yes": 502, "Uncertain": "preResult" }
                    },
                    {
                        id: 502, type: "radio", question: "(2.2.2.2) Match the intervention to signal or receptor of group of the molecular of disease development mechanism",
                        options: ["Yes", "No", "Uncertain"],
                        next: { "Yes": 510, "No": 520, "Uncertain": "preResult" }
                    },
                    {
                        id: 510, type: "radio", question: "Sustainable normalization of the originated cell",
                        options: ["Yes", "No", "Uncertain"],
                        next: { "Yes": 511, "No": 512, "Uncertain": "preResult" }
                    },
                    {
                        id: 511, type: "radio", question: "True remission",
                        options: ["Yes", "Uncertain"],
                        next: { "Yes": "finalResult", "Uncertain": "preResult" }
                    },
                    {
                        id: 512, type: "radio", question: "Root cause is existing",
                        options: ["Yes", "No", "Uncertain"],
                        next: { "Yes": 513, "No": 514, "Uncertain": "preResult" }
                    },
                    {
                        id: 513, type: "radio", question: "Controlling",
                        options: ["Yes", "Uncertain"],
                        next: { "Yes": "finalResult", "Uncertain": "preResult" }
                    },
                    {
                        id: 514, type: "radio", question: "Probable a symptomatic interaction",
                        options: ["Yes", "Uncertain"],
                        next: { "Yes": "finalResult", "Uncertain": "preResult" }
                    },
                    {
                        id: 520, type: "radio", question: "Match to any section of the molecular cascade",
                        options: ["Yes", "No", "Uncertain"],
                        next: { "Yes": 521, "No": 522, "Uncertain": "preResult" }
                    },
                    {
                        id: 521, type: "radio", question: "Match to Symptomatic treatment for the molecular cascade reacted to clinical sign or a symptom",
                        options: ["Yes", "Uncertain"],
                        next: { "Yes": "finalResult", "Uncertain": "preResult" }
                    },
                    {
                        id: 522, type: "radio", question: "Match to Predisposing factor",
                        options: ["Yes", "Uncertain"],
                        next: { "Yes": 523, "Uncertain": "preResult" }
                    },
                    {
                        id: 523, type: "radio", question: "Prevention of predispose factor",
                        options: ["Yes", "Uncertain"],
                        next: { "Yes": "finalResult", "Uncertain": "preResult" }
                    }
                ]
            }
        ]
    }
];
