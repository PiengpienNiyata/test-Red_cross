import { defineStore } from "pinia";

export const useQuestionnaireStore = defineStore("questionnaire", {
  state: () => ({
    researcher: {
      name: "",
      project_name: "",
      branch_info: "",
      phone_number: "",
      email: "",
      chosen_disease: "",
      chosen_intervention: "",
    },
    // Using `any` to allow for more flexible answer structures (files, nested objects)
    answers: {} as Record<number, any>, 
    researcherID: null as number | null,
    // finalRoute: null as string | null,
        suggestedRoutes: [] as string[],
  }),
  actions: {
    setAnswers(data: Record<number, any>) {
      this.answers = { ...this.answers, ...data };
    },
    setResearcherID(id: number) {
      this.researcherID = id;
    },
    // setFinalRoute(route: string) {
    //   this.finalRoute = route;
    // },
        setSuggestedRoutes(routes: string[]) {
      this.suggestedRoutes = routes;
    },
    /**
     * Processes answers from the first questionnaire to populate researcher info.
     * @param answersObject The answers object, typically from Questionnaire 1.
     */
    processResearcherInfo(answersObject: Record<number, string>) {
      this.researcher.name = answersObject[1001] || "";
      this.researcher.project_name = answersObject[1002] || "";
      this.researcher.branch_info = answersObject[1003] || "";
      this.researcher.phone_number = answersObject[1004] || "";
      this.researcher.email = answersObject[1005] || "";
      this.researcher.chosen_disease = answersObject[1006] || "";
      this.researcher.chosen_intervention = answersObject[1007] || "";
    },
    resetStore() {
      // Reset logic as before
      this.researcher = {
        name: "",
        project_name: "",
        branch_info: "",
        phone_number: "",
        email: "",
        chosen_disease: "",
        chosen_intervention: "",
      };
      this.answers = {};
      this.researcherID = null;
      // this.finalRoute = null;
      this.suggestedRoutes = [];

    },
    resetServey() {
      // Reset logic as before
      Object.keys(this.answers).forEach((key) => {
        const numericKey = Number(key);
        if (numericKey < 600 || numericKey > 1100) {
          delete this.answers[numericKey as keyof typeof this.answers];
        }
      });
      this.researcherID = null;
      // this.finalRoute = null;
      this.suggestedRoutes = [];
    },
  },
});