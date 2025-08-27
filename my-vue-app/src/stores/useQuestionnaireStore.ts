import { defineStore } from "pinia";
interface VersionHistoryItem {
  id: number;
  version: number;
  submitted_at: string;
  status: number;
}

function stripFileObjects(obj: any): any {
  if (obj instanceof File) {
    return { name: obj.name, isNewUnsavedFile: true };
  }
  if (Array.isArray(obj)) {
    return obj.map(stripFileObjects);
  }
  if (obj && typeof obj === "object") {
    const newObj: { [key: string]: any } = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        newObj[key] = stripFileObjects(obj[key]);
      }
    }
    return newObj;
  }
  return obj;
}

// @ts-ignore
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
    answers: {} as Record<number, any>,
    previousAnswers: {} as Record<number, any>,
    liveFileAnswers: [] as { questionId: string; file: File }[],

    researcherID: null as number | null,
    suggestedRoutes: [] as string[],
    currentToken: null as string | null,
    currentVersion: 0 as number,
    currentRemark: null as string | null,
    currentStatus: null as number | null,
    showReviewerFeedback: true,
    versionHistory: [] as VersionHistoryItem[],
    latestVersion: 0 as number,
    authToken: null as string | null,
    currentQuestionId: null as number | null,
    contradictionStep: 1 as number,
  }),

  actions: {
    setAuthToken(token: string) {
      this.authToken = token;
    },
    clearAuthToken() {
      this.authToken = null;
    },

    setCurrentTokenAndVersion(token: string, version: number) {
      this.currentToken = token;
      this.currentVersion = version;
    },

    setAnswers(data: Record<number, any>) {
      this.answers = { ...this.answers, ...data };
    },
    setPreviousAnswers(data: Record<number, any>) {
      this.previousAnswers = data;
    },
    setLiveFiles(files: { questionId: string; file: File }[]) {
      this.liveFileAnswers = files;
    },
    clearLiveFiles() {
      this.liveFileAnswers = [];
    },
    setResearcherID(id: number) {
      this.researcherID = id;
    },

    setSuggestedRoutes(routes: string[]) {
      this.suggestedRoutes = routes;
    },
    setCurrentRemark(remark: string) {
      this.currentRemark = remark;
    },
    setCurrentStatus(status: number) {
      this.currentStatus = status;
    },
    setVersionHistory(versions: VersionHistoryItem[]) {
      this.versionHistory = versions;
      if (versions.length > 0) {
        this.latestVersion = versions[0].version;
      }
    },

    setCurrentQuestionId(id: number | null) {
      this.currentQuestionId = id;
    },

    hideReviewerFeedback() {
      this.showReviewerFeedback = false;
    },
    processResearcherInfo(answersObject: Record<number, string>) {
      if (!this.researcher) {
        this.researcher = {
          name: "",
          project_name: "",
          branch_info: "",
          phone_number: "",
          email: "",
          chosen_disease: "",
          chosen_intervention: "",
        };
      }

      this.researcher.name = answersObject[1001] || "";
      this.researcher.project_name = answersObject[1002] || "";
      this.researcher.branch_info = answersObject[1003] || "";
      this.researcher.phone_number = answersObject[1004] || "";
      this.researcher.email = answersObject[1005] || "";
      this.researcher.chosen_disease = answersObject[1006] || "";
      this.researcher.chosen_intervention = answersObject[1007] || "";
    },
    resetStore() {
      this.latestVersion = 0;
      this.authToken = null;

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
      this.liveFileAnswers = [];
      this.previousAnswers = {};
      this.suggestedRoutes = [];
      this.currentToken = null;
      this.currentVersion = 0;
      this.currentRemark = null;
      this.currentStatus = null;
      this.showReviewerFeedback = true;
      this.versionHistory = [];
      this.latestVersion = 0;
      this.currentQuestionId = null;
    },
    resetQuestionnaire() {
      this.latestVersion = 0;

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
      this.liveFileAnswers = [];
      this.previousAnswers = {};
      this.suggestedRoutes = [];
      this.currentToken = null;
      this.currentVersion = 0;
      this.currentRemark = null;
      this.currentStatus = null;
      this.showReviewerFeedback = true;
      this.versionHistory = [];
      this.latestVersion = 0;
      this.currentQuestionId = null;
    },
    resetServey() {
      Object.keys(this.answers).forEach((key) => {
        const numericKey = Number(key);
        if (numericKey < 600 || numericKey > 1100) {
          delete this.answers[numericKey as keyof typeof this.answers];
        }
      });
      this.researcherID = null;
      this.liveFileAnswers = [];
      this.currentQuestionId = null;

      this.suggestedRoutes = [];
    },

    setContradictionStep(step: number) {
      this.contradictionStep = step;
    },
  },

  persist: {
    storage: sessionStorage,
    paths: [
      "researcher",
      "answers",
      "previousAnswers",
      "researcherID",
      "suggestedRoutes",
      "currentToken",
      "currentVersion",
      "currentRemark",
      "currentStatus",
      "showReviewerFeedback",
      "versionHistory",
      "latestVersion",
      "authToken",
      "currentQuestionId",
    ],
    serializer: {
      serialize: (state: any) => {
        const cleanedState = stripFileObjects(state);
        return JSON.stringify(cleanedState);
      },
      deserialize: (jsonString: string) => {
        return JSON.parse(jsonString);
      },
    },
  },
});
