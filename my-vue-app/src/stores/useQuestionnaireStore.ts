import { defineStore } from "pinia";

export const useQuestionnaireStore = defineStore("questionnaire", {
  state: () => ({
    researcher: {
      name: "",
      project_name: "",
      branch_info: "",
      phone_number: "",
      email: "",
    },
    answers: {} as Record<number, string | string[]>,
    researcherID: null as number | null,
    finalRoute: null as string | null,  }),
  actions: {
    setResearcher(data: any) {
      this.researcher = data;
    },
    setAnswers(data: Record<number, string | string[]>) {
      this.answers = { ...this.answers, ...data };
    },
    setResearcherID(id: number) {
      this.researcherID = id;
    },
    setFinalRoute(route: string){
        this.finalRoute = route;
    },
    resetStore() {
      this.researcher = {
        name: "",
        project_name: "",
        branch_info: "",
        phone_number: "",
        email: "",
      };
      this.answers = {};
      this.researcherID = null;
      this.finalRoute = null;
    },
    resetServey() {
      Object.keys(this.answers).forEach((key) => {
        const numericKey = Number(key);
        if (numericKey < 600 || numericKey > 1100) {
          delete this.answers[numericKey as keyof typeof this.answers];
        }
      });
    
      this.researcherID = null;
      this.finalRoute = null;
    }
    
    
    
  },
});