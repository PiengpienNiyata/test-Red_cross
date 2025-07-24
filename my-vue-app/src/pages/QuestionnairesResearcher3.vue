<script setup lang="ts">
import { computed, ref } from "vue";
import { useQuestionnaireStore } from "@/stores/useQuestionnaireStore";
import { useRouter } from "vue-router";
import { questionnaireData as questionnaireData1 } from "@/stores/questionnaires1";
import { questionnaireData as questionnaireData2 } from "@/stores/questionnaires2";
import type { Question2 } from "@/stores/questionnaires2";
import { VITE_API_BASE_URL } from "@/stores/config";
import ConfidentialForm from "@/components/ConfidentialForm.vue";
import { storeToRefs } from "pinia";
import html2pdf from "html2pdf.js";

const pdfContent = ref<HTMLElement | null>(null);
const store = useQuestionnaireStore();
const router = useRouter();

const { answers, suggestedRoutes } = storeToRefs(store);
type FileItem = File | { id: number; name: string; rehydrated: true };
const exportToPdf = () => {
  if (!pdfContent.value) {
    console.error("PDF content element not found.");
    return;
  }

  // Safety check to ensure the answer for the project name exists.
  if (!answers.value[1002]) {
    console.error(
      "Project Name (answer 1002) is not available for the PDF filename."
    );
  }

  const options = {
    margin: 1,
    // Use the project name directly from the answers ref.
    filename: `RIRM-Summary-${answers.value[1002] || "report"}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
  };

  html2pdf().from(pdfContent.value).set(options).save();
};

const getFileDownloadUrl = (fileId: number) => {
  return `${VITE_API_BASE_URL}/api/file/${fileId}`;
};

const getQuestionById = (id: number): Question2 | null => {
  for (const section of questionnaireData1[0].sections) {
    const questions = (section as any).questions || [];
    const foundQuestion = questions.find((q: any) => q.id === id);
    if (foundQuestion) return foundQuestion;
  }
  return null;
};

const getQuestionById2 = (id: number): Question2 | null => {
  for (const section of questionnaireData2[0].sections) {
    const foundQuestion = section.questions.find((q) => q.id === id);
    if (foundQuestion) return foundQuestion;
  }
  return null;
};

const firstFormAnswers = computed(
  () =>
    Object.entries(store.answers)
      .filter(([id]) => Number(id) >= 1001 && Number(id) <= 1014)
      .map(([id, answer]) => {
        const question = getQuestionById(Number(id));
        return question ? { ...question, answer } : null;
      })
      .filter((q) => q !== null) as Question2[]
);

const secondFormAnswers = computed(
  () =>
    Object.entries(store.answers)
      .filter(
        ([id]) => (Number(id) < 600 || Number(id) > 1100) && Number(id) < 1001
      )
      .map(([id, answer]) => {
        const question = getQuestionById2(Number(id));
        return question ? { ...question, answer } : null;
      })
      .filter((q) => q !== null) as Question2[]
);

const finalDisplayRoute = computed(() => {
  if (suggestedRoutes.value.includes("Route C")) {
    return "Route C";
  }
  return suggestedRoutes.value.join(", ");
});

const editAnswers = () => {
  store.resetServey();
  router.push("/questionnairesResearcher");
};

const formatCheckboxAnswer = (answer: any): string => {
  if (!answer || !Array.isArray(answer.main)) return "";

  const formattedParts = answer.main.map((mainOpt: string) => {
    const mainLabel = mainOpt.split("||")[0];
    const subAnswer = answer.subs?.[mainLabel];

    if (subAnswer && subAnswer.length > 0) {
      const subAnswerString = Array.isArray(subAnswer)
        ? subAnswer.join(", ")
        : subAnswer;
      return `${mainLabel} (${subAnswerString})`;
    }

    return mainLabel;
  });

  return formattedParts.join(", ");
};

const submissionSuccess = ref(false);
const submissionError = ref(false);

const submitFinalResponse = async () => {
  try {
    console.log(store.currentToken);
    console.log(store.currentVersion);
    console.log(store.answers);
    console.log(store.researcherID);
    console.log(store.researcher);
    // --- Step 1 & 2: Validate and create researcher (No changes here) ---
    store.processResearcherInfo(store.answers as Record<string, string>);
    const { name, project_name, branch_info, phone_number, email } =
      store.researcher;
    if (!name || !project_name || !branch_info || !phone_number || !email) {
      alert("Please fill in all researcher details before submitting!");
      return;
    }
    let researcherID = store.researcherID;
    if (!researcherID) {
      const researcherResponse = await fetch(
        `${VITE_API_BASE_URL}/api/researcher`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(store.researcher),
        }
      );
      const researcherResult = await researcherResponse.json();
      if (!researcherResponse.ok) throw new Error("Failed to save researcher");
      researcherID = researcherResult.researcher.id;
      store.setResearcherID(researcherID!);
    }

    // --- Step 3: Separate all answers correctly (No changes here) ---
    const fileAnswersToUpload: { questionId: string; file: File }[] = [];
    const otherAnswers: Record<string, any> = {};
    const researchContext: Record<string, any> = {
      research_questions: {},
      molecular_signaling: {},
    };
    let confidentialityLevel = "";
    Object.entries(answers.value).forEach(([id, value]) => {
      if (value && typeof value === "object") {
        if (value.files instanceof FileList) {
          Array.from(value.files).forEach((file: any) =>
            fileAnswersToUpload.push({ questionId: id, file })
          );
        } else if (value.fileData) {
          Object.values(value.fileData).forEach((fileInfo: any) => {
            Array.from(fileInfo.files).forEach((file: any) =>
              fileAnswersToUpload.push({ questionId: id, file })
            );
          });
        }
      }
      if (Number(id) >= 1008 && Number(id) <= 1010) {
        const keyMap: Record<string, string> = {
          "1008": "principle",
          "1009": "factual_statement",
          "1010": "implication",
        };
        researchContext.research_questions[keyMap[id]] = value;
      } else if (Number(id) >= 1011 && Number(id) <= 1013) {
        const keyMap: Record<string, string> = {
          "1011": "principle",
          "1012": "factual_statement",
          "1013": "implication",
        };
        researchContext.molecular_signaling[keyMap[id]] = value;
      } else if (Number(id) === 3001) {
        if (value && value.selectedOption && value.subs) {
          const mainAnswer = value.selectedOption;
          const subAnswer = value.subs[mainAnswer];
          confidentialityLevel = `${mainAnswer} (Level: ${subAnswer})`;
        }
      } else {
        otherAnswers[id] = value;
      }
    });

    // --- Step 4: Create the Main Response Record (No changes here) ---
    const response = await fetch(`${VITE_API_BASE_URL}/api/response`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        researcher_id: researcherID,
        questionnaire_id: 1,
        answers: otherAnswers,
        final_route: suggestedRoutes.value.join(", ") || "unknown",
        disease_name: answers.value[1006] || "",
        intervention: answers.value[1007] || "",
        research_context: researchContext,
        confidentiality_level: confidentialityLevel,
        token: store.currentToken,
        version: store.currentVersion,
        researcher_name: store.researcher.name,
        researcher_email: store.researcher.email,
      }),
    });
    const responseResult = await response.json();
    if (!response.ok) throw new Error("Failed to save response");

    // --- UPDATED LOGIC ---
    // 1. Get the responseID AND the token from the backend's response
    const responseID = responseResult.id;
    const responseToken = responseResult.token;

    // --- Step 5: Upload All Files (No changes here) ---
    if (fileAnswersToUpload.length > 0) {
      const uploadPromises = fileAnswersToUpload.map(({ questionId, file }) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("response_id", String(responseID));
        formData.append("question_id", questionId);
        return fetch(`${VITE_API_BASE_URL}/api/response/file`, {
          method: "POST",
          body: formData,
        });
      });
      const uploadResults = await Promise.all(uploadPromises);
      const failedUpload = uploadResults.find((res) => !res.ok);
      if (failedUpload) {
        throw new Error(`Failed to upload file: ${await failedUpload.text()}`);
      }
    }

    const editUrl = `${window.location.origin}/edit-response/${responseToken}`;

    // --- Step 6: Show Success and Log the Edit URL ---
    await fetch(`${VITE_API_BASE_URL}/api/response/${responseID}/finalize`, {
      method: "POST",
    });

    // 2. Construct the full edit URL

    // 3. Log it to the console for testing
    console.log("--- SUBMISSION SUCCESSFUL ---");
    console.log("Edit URL for this submission:", editUrl);

    submissionSuccess.value = true;
  } catch (error) {
    console.error("Error submitting data:", error);
    submissionError.value = true;
  }
};

const startNewSurvey = () => {
  store.resetStore();
  router.push("/");
};

const createObjectURL = (file: File) => {
  return URL.createObjectURL(file);
};

const summaryStep2 = computed(() => {
  const answer201 = answers.value[201];
  const answer202 = answers.value[202];

  const q201 = getQuestionById2(201);
  const q202 = getQuestionById2(202);

  if (!answer201 || !answer202 || !q201 || !q202) {
    return null;
  }

  let stagingTypingDesc = "";
  if (typeof answer201 === "string") {
    if (answer201.startsWith("Yes, both staging and typing")) {
      const ref = answer201.split("ref : ")[1] || "not specified";
      stagingTypingDesc = `that there is both staging and typing (ref: <span class="dynamic-text">${ref}</span>)`;
    } else if (answer201 === "Yes, staging only.") {
      const answer201_5 = answers.value[201.5] || "details not provided";
      stagingTypingDesc = `that there is staging only, specifically: "<em>${answer201_5}</em>"`;
    } else if (answer201.startsWith("Yes, typing only.")) {
      const typing = answer201.split(": ")[1]?.slice(0, -1) || "not specified";
      stagingTypingDesc = `that there is typing only, defined as: "<em>${typing}</em>"`;
    } else if (answer201 === "No") {
      stagingTypingDesc = "that there are no staging or typing classifications";
    } else if (answer201 === "Uncertain") {
      stagingTypingDesc =
        "that it is uncertain if staging or typing classifications exist";
    }
  }

  let criteriaDesc = "";
  if (typeof answer202 === "string") {
    if (answer202.startsWith("Yes")) {
      const criteriaText =
        answer202.split(": ")[1]?.slice(0, -1) || "not provided";
      criteriaDesc = `you have defined criteria ("<em>${criteriaText}</em>")`;
    } else {
      criteriaDesc = "you do not have defined diagnostic criteria";
    }
  }

  return `From your response to question B-2 - "<em>${q202.question}</em>", where ${criteriaDesc}, these are compared with the disease's classifications from question B-1 - "<em>${q201.question}</em>" (in which you indicated ${stagingTypingDesc}). Based on this comparison, the originating cell type is identified as <span class="dynamic-text">N/A</span>.`;
});

const summaryStep3 = computed(() => {
  const answer101 = answers.value[101];
  const q101 = getQuestionById2(101);

  if (!answer101 || !q101) {
    return null;
  }

  const diseaseName = `<span class="dynamic-text">${
    answers.value[1006] || "the disease"
  }</span>`;
  let mechanismText = `<span class="dynamic-text">undefined</span>`;

  let finalAnswerString = "";
  if (typeof answer101 === "object" && answer101.selectedOption) {
    finalAnswerString = answer101.selectedOption;
  } else if (typeof answer101 === "string") {
    finalAnswerString = answer101;
  }

  if (finalAnswerString.startsWith("Yes")) {
    const match = finalAnswerString.match(/mechanism : (.*) and Attach/);
    const extractedText = match ? match[1] : "";

    if (extractedText && extractedText.trim() !== "") {
      mechanismText = `<em>${extractedText}</em>`;
    }
  }

  return `From your response to question A-1 - "<em>${q101.question}</em>", the mechanism of ${diseaseName} is deduced as ${mechanismText}.`;
});

const summaryStep4 = computed(() => {
  const answer201 = answers.value[201];
  const answer202 = answers.value[202];

  if (!answer201 || !answer202) {
    return null;
  }

  const diseaseName = `<span class="dynamic-text">${
    answers.value[1006] || "the disease"
  }</span>`;

  let stagingTypingDesc = "";
  if (typeof answer201 === "string") {
    if (answer201.startsWith("Yes, both staging and typing")) {
      const ref = answer201.split("ref : ")[1] || "not specified";
      stagingTypingDesc = `implying that there is both staging and typing (ref: <span class="dynamic-text">${ref}</span>)`;
    } else if (answer201 === "Yes, staging only.") {
      const answer201_5 = answers.value[201.5] || "details not provided";
      stagingTypingDesc = `implying that there is staging only, specifically: "<em>${answer201_5}</em>"`;
    } else if (answer201.startsWith("Yes, typing only.")) {
      const typing = answer201.split(": ")[1]?.slice(0, -1) || "not specified";
      stagingTypingDesc = `implying that there is typing only, defined as: "<em>${typing}</em>"`;
    } else {
      stagingTypingDesc = `implying that there are no staging or typing classifications`;
    }
  }

  let criteriaDesc = "";
  if (typeof answer202 === "string") {
    if (answer202.startsWith("Yes")) {
      criteriaDesc = `implying that you have defined criteria`;
    } else {
      criteriaDesc = `implying that you do not have defined diagnostic criteria`;
    }
  }

  const probableInducers = ["N/A", "N/A", "N/A"];
  const n = probableInducers.length;
  const inducedResult = `<span class="dynamic-text">N/A</span>`;

  const inducersList = probableInducers.map((item) => `<br>• ${item}`).join("");

  return `By comparing molecular data associated with cell types involved in different stages and types (${stagingTypingDesc}) against molecules involved across all cell types listed in diagnostic criteria (${criteriaDesc}), it is inferred that the <strong>${n}</strong> probable initial inducers of ${diseaseName} are: ${inducersList}<br> All of these are capable of inducing ${inducedResult}.`;
});

const summaryStep5 = computed(() => {
  const answer103 = answers.value[103];
  const q103 = getQuestionById2(103);

  if (!answer103 || !q103) {
    return null;
  }

  const diseaseName = `<span class="dynamic-text">${
    answers.value[1006] || "the disease"
  }</span>`;
  let title = "";
  let body = "";

  if (answer103 === "More than 80% efficiency") {
    title = "Remission-Oriented Research Question";
    body = `Given your response to question A-3 ("<em>${q103.question}</em>") was "<em>${answer103}</em>", the research question is focused on confirming that eliminating or controlling known factors can induce true remission in ${diseaseName}.`;
  } else {
    title = "Exploratory Pre-Remission Research Question";
    body = `Based on your response to question A-3 ("<em>${q103.question}</em>") where you indicated the efficiency is "<em>${answer103}</em>", the focus shifts to an exploratory question: To formulate a research question that identifies unknown factors which must be addressed before confirming remission-inducing therapies or control strategies.`;
  }

  return `<strong>${title}:</strong> ${body}`;
});

const summaryParagraphs = computed(() => {
  const paragraphs: { text: string }[] = [];
  const diseaseName = `<span class="dynamic-text">${
    store.answers[1006] || "the disease"
  }</span>`;

  const buildDecisionSentence = (
    text: string,
    words: string,
    route: string
  ) => {
    const styledText = text.replace(
      words,
      `<span class="decision-words">${words}</span>`
    );
    return `<span class="decision-sentence">${styledText.replace(
      route,
      `<span class="route-name">${route}</span>`
    )}</span>`;
  };

  const answer102 = store.answers[102];
  const answer201 = store.answers[201];
  const answer203 = store.answers[203];

  if (answer102 === "No" && answer203 === "No") {
    paragraphs.push({
      text: `Your responses indicate that while ${diseaseName} has a consistent diagnostic model with no contradictions (question B-3), the current intervention is unable to achieve a high rate of true remission (question A-2). This combination suggests the disease, while a single entity, has a complex pathogenesis that the current treatment does not fully address. ${buildDecisionSentence(
        "This supports investigating its complexity via Route H.",
        "investigating its complexity via",
        "Route H"
      )}`,
    });
  }
  if (answer102) {
    const q102_text = getQuestionById2(102)?.question || "";
    if (answer102.selectedOption?.startsWith("Yes")) {
      paragraphs.push({
        text: `Based on your response to question A-2 - "<em>${q102_text}</em>", your assertion that the intervention can achieve a high rate of true remission suggests a highly effective mechanism targeting a core pathway. ${buildDecisionSentence(
          "This supports the decision to pursue Route A.",
          "to pursue",
          "Route A"
        )}`,
      });
    } else {
      paragraphs.push({
        text: `Based on your response to question A-2 - "<em>${q102_text}</em>", the inability of the intervention to achieve a high rate of true remission indicates that a single, clear molecular target is unlikely or unproven. ${buildDecisionSentence(
          "This supports the decision not to pursue Route A.",
          "not to pursue",
          "Route A"
        )}`,
      });
    }
  }

  if (answer201) {
    const q201_text = getQuestionById2(201)?.question || "";
    if (answer201 === "No") {
      paragraphs.push({
        text: `From your response to question B-1 - "<em>${q201_text}</em>", you've indicated there is no existing staging or typing classification for ${diseaseName}. ${buildDecisionSentence(
          "This observation justifies choosing Route B.",
          "justifies choosing",
          "Route B"
        )}`,
      });
    } else if (typeof answer201 === "string" && answer201.startsWith("Yes")) {
      paragraphs.push({
        text: `From your response to question B-1 - "<em>${q201_text}</em>", your acknowledgment of existing staging and/or typing for ${diseaseName} indicates the disease is not a single, uniform entity. ${buildDecisionSentence(
          "This contradicts the core assumption of Route B, justifying the decision not to pursue this route.",
          "not to pursue this route",
          "Route B"
        )}`,
      });
    }
  }

  if (answer203) {
    const q203_text = getQuestionById2(203)?.question || "";
    if (typeof answer203 === "string" && answer203.startsWith("Yes")) {
      paragraphs.push({
        text: `By identifying a contradiction within the diagnostic criteria (question B-3 - "<em>${q203_text}</em>"), you suggest that '${diseaseName}' may be a syndrome of related conditions. ${buildDecisionSentence(
          "This critical insight directs the investigation towards Route C.",
          "directs the investigation towards",
          "Route C"
        )}`,
      });
    } else if (answer203 === "No") {
      paragraphs.push({
        text: `Your response to question B-3 - "<em>${q203_text}</em>", indicating no contradiction, supports the model of ${diseaseName} as a single, cohesive disease. ${buildDecisionSentence(
          "This allows for the exploration of its pathway via Route D.",
          "allows for the exploration of its pathway via",
          "Route D"
        )}`,
      });
    }
  }

  if (answer201 === "Yes, staging only.") {
    const answer201_5 = store.answers[201.5];
    if (answer201_5 === "Have 2 stages") {
      paragraphs.push({
        text: `Your identification of two distinct stages (question B-1 | staging only) provides a clear framework for comparative analysis. ${buildDecisionSentence(
          "This supports pursuing Route E to investigate the molecular transition between stages.",
          "supports pursuing",
          "Route E"
        )}`,
      });
    } else if (answer201_5 === "Have more than 2 stages") {
      paragraphs.push({
        text: `The presence of more than two stages (question B-1 | more than 2 stages) suggests a complex, multi-step progression. ${buildDecisionSentence(
          "This complexity warrants the detailed analysis provided by Route F.",
          "warrants the detailed analysis provided by",
          "Route F"
        )}`,
      });
    }
  } else if (
    typeof answer201 === "string" &&
    answer201.startsWith("Yes, typing only")
  ) {
    paragraphs.push({
      text: `By specifying that ${diseaseName} has typing but not staging (question 201), the investigation is focused on the molecular differences between subtypes. ${buildDecisionSentence(
        "This makes Route G the logical next step.",
        "makes Route G the logical next step",
        "Route G"
      )}`,
    });
  } else if (
    typeof answer201 === "string" &&
    answer201.startsWith("Yes, both")
  ) {
    paragraphs.push({
      text: `Your confirmation of both staging and typing for ${diseaseName} (question 201) points to a complex pathogenesis. ${buildDecisionSentence(
        "This supports Route H as the most appropriate and comprehensive approach.",
        "supports Route H as the most appropriate",
        "Route H"
      )}`,
    });
  }

  return paragraphs;
});

const isConfidentialFormComplete = computed(() => {
  const confidentialAnswer = answers.value[3001];
  if (
    !confidentialAnswer ||
    typeof confidentialAnswer !== "object" ||
    !confidentialAnswer.selectedOption
  ) {
    return false;
  }
  const mainSelection = confidentialAnswer.selectedOption;
  const subAnswer = confidentialAnswer.subs?.[mainSelection];
  if (subAnswer === null || subAnswer === undefined || subAnswer === "") {
    return false;
  }
  return true;
});

// Add these new computed properties after your other computed properties

const hasNonsenseStagingTyping = computed(() => {
  const answer104 = answers.value[104];
  const answer201 = answers.value[201];

  // Condition 1: User implies a shared pathway in Q104...
  if (typeof answer104 === 'string' && answer104.startsWith('Yes')) {
    // ...but then fails to select the corresponding staging/typing in Q201.
    if (
      typeof answer201 === 'string' &&
      !answer201.startsWith('Yes, both staging and typing') &&
      !answer201.startsWith('Yes, typing only')
    ) {
      return true;
    }
  }
  return false;
});

const hasNonsenseContradiction = computed(() => {
  const answer202 = answers.value[202];
  const answer203 = answers.value[203];

  // Condition 2: User says no criteria exist in Q202...
  if (answer202 === 'No') {
    // ...but then claims to have found a contradiction within them in Q203.
    if (typeof answer203 === 'string' && answer203.startsWith('Yes')) {
      return true;
    }
  }
  return false;
});
</script>

<template>
  <div class="final-review">
    <div ref="pdfContent">
      <div class="questionnaire">
        <div
          v-for="section in questionnaireData1[0].sections"
          :key="section.name"
          class="section"
        >
          <h4 v-if="section.name !== 'null'" class="section-title">
            {{ section.name }}
          </h4>
          <div class="row">
            <div
              v-for="q in firstFormAnswers.filter(
              (fq) =>
                (section as any).questions?.some((sq: any) => sq.id === fq.id)
            )"
              :key="q.id"
              :class="{
                'col-md-6': [1001, 1002, 1004, 1005].includes(q.id),
                'col-md-12': q.id === 1003,
              }"
            >
              <label class="question-label">{{ q.question }}</label>
              <input
                v-if="q.type === 'text'"
                :value="q.answer"
                type="text"
                class="input-text"
                disabled
              />
              <textarea
                v-if="q.type === 'textarea'"
                :value="q.answer"
                class="input-text"
                disabled
                rows="3"
                style="field-sizing: content"
              ></textarea>
            </div>
          </div>
        </div>
      </div>

      <div class="questionnaire">
        <h3 class="aa">Explore the precision intervention</h3>
        <div v-for="q in secondFormAnswers" :key="q.id" class="answer-block">
          <label class="question-label">{{ q.question }}</label>

          <p v-if="typeof q.answer === 'string'" class="answer-text">
            <span style="color: red">Your answer : </span
            >{{ q.answer.split("||")[0] }}
          </p>
          <p v-else-if="Array.isArray(q.answer)" class="answer-text">
            <span style="color: red">Your answer : </span
            >{{ q.answer.join(", ") }}
          </p>
          <div v-else-if="typeof q.answer === 'object' && q.answer !== null">
            <div
              v-if="
                typeof q.answer === 'object' &&
                q.answer !== null &&
                'selectedOption' in q.answer
              "
            >
              <p class="answer-text">
                <span style="color: red">Your answer : </span>
                {{ (q.answer as any).selectedOption.split("||")[0] }}
                <span
                  v-for="(subAnswer, key) in (q.answer as any).subs"
                  :key="key"
                >
                  (
                  {{
                    Array.isArray(subAnswer) ? subAnswer.join(", ") : subAnswer
                  }}
                  )
                </span>
              </p>

              <div v-if="(q.answer as any).fileData" class="sub-answer-block">
                <strong>Attached Files:</strong>
                <ul>
                  <li
                    v-for="(fileInfo, key) in (q.answer as any).fileData"
                    :key="key"
                  >
                    <!-- <span
                      v-for="file in Array.from(fileInfo.files as FileList)"
                      :key="file.name"
                      style="margin-left: 8px"
                    >
                      <a
                        :href="createObjectURL(file)"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {{ file.name }}
                      </a>
                    </span> -->
                    <!-- <span
                      v-for="file in (fileInfo.files as FileItem[])"
                      :key="file.name"
                      style="margin-left: 8px"
                    >
                      <a
                        v-if="!file.rehydrated"
                        :href="createObjectURL(file)"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {{ file.name }}
                      </a>
                      <span v-else>{{ file.name }}</span>
                    </span> -->
                    <span
                      v-for="file in (fileInfo.files as FileItem[])"
                      :key="file.name"
                      style="margin-left: 8px"
                    >
                      <a
                        v-if="'rehydrated' in file"
                        :href="getFileDownloadUrl(file.id)"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {{ file.name }}
                      </a>
                      <a
                        v-else
                        :href="createObjectURL(file)"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {{ file.name }}
                      </a>
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <div
              v-else-if="
                typeof q.answer === 'object' &&
                q.answer !== null &&
                'main' in q.answer
              "
            >
              <p class="answer-text">
                <span style="color: red">Your answer : </span
                >{{ formatCheckboxAnswer(q.answer) }}
              </p>
            </div>

            <div
              v-else-if="
                typeof q.answer === 'object' &&
                q.answer !== null &&
                'files' in q.answer
              "
            >
              <!-- <ul>
                <li
                  v-for="file in Array.from((q.answer as any).files as FileList)"
                  :key="file.name"
                >
                  <a
                    :href="createObjectURL(file)"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {{ file.name }}
                  </a>
                </li>
              </ul> -->
              <!-- <ul>
                <li
                  v-for="file in ((q.answer as any).files as FileItem[])"
                  :key="file.name"
                >
                  <a
                    v-if="!file.rehydrated"
                    :href="createObjectURL(file)"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {{ file.name }}
                  </a>
                  <span v-else>{{ file.name }}</span>
                </li>
              </ul> -->
              <ul>
                <li
                  v-for="file in ((q.answer as any).files as FileItem[])"
                  :key="file.name"
                >
                  <a
                    v-if="'rehydrated' in file"
                    :href="getFileDownloadUrl(file.id)"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {{ file.name }}
                  </a>
                  <a
                    v-else
                    :href="createObjectURL(file)"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {{ file.name }}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <h3 v-if="suggestedRoutes.length > 0" style="margin-left: 8px">
          Road Map Suggestion:
          <span class="final-route-text">{{ finalDisplayRoute }}</span>
        </h3>
      </div>
      <div class="questionnaire">
        <h2 style="margin-bottom: 20px">Step of extrapolation</h2>
        <h1
          class="aa"
          style="margin-left: 15px; padding-top: 0px; margin-top: 0px"
        >
          Step 1 : Choose the legitimated route to explore for the originating
          cell
        </h1>
        <!-- <h1 class="aa" style="padding-top: 0px; margin-top: 0px">
        Step 1 : Choose the legitimated route to explore for the originating
        cell
      </h1> -->

        <div style="margin-left: 30px; margin-right: 30px">
          <div
            v-for="(p, index) in summaryParagraphs"
            :key="index"
            class="summary-item"
          >
            <span class="summary-bullet">•</span>
            <div v-if="p.text" class="summary-text-content">
              <span v-html="p.text"></span>
            </div>
            <div v-else class="summary-text-content">
              <span class="dynamic-text">
                (Answer questions 201 and 202 to generate this section.)
              </span>
            </div>
          </div>
        </div>
        <br style="padding-bottom: 0px" />

        <!-- <h1
        class="aa"
        style="margin-left: 15px; padding-top: 0px; margin-top: 0px"
      >
        Step 2 : Identify the originating cell
      </h1>

      <div style="margin-left: 30px; margin-right: 30px">
        <div class="summary-item">
          <span class="summary-bullet">•</span> -->
        <!-- <div v-if="summaryStep2" class="summary-text-content">
            <span v-html="summaryStep2"></span>
          </div>
          <div v-else class="summary-text-content">
            <span class="dynamic-text">
              (Answer questions 201 and 202 to generate this section.)
            </span>
          </div> -->
        <!-- <div class="summary-text-content">
            <span style="color: red"
              >N/A (Insufficient data. <br />Need : originating cell type
              identifier)</span
            >
          </div>
        </div>
      </div> -->

        <!-- <h1
        class="aa"
        style="margin-left: 15px; padding-top: 0px; margin-top: 0px"
      >
        Step 3 : Mechanism of the disease development
      </h1>

      <div style="margin-left: 30px; margin-right: 30px">
        <div class="summary-item">
          <span class="summary-bullet">•</span>
          <div v-if="summaryStep3" class="summary-text-content">
            <span v-html="summaryStep3"></span>
          </div>
          <div v-else class="summary-text-content">
            <span class="dynamic-text">
              (Answer questions A-1 to generate this section.)
            </span>
          </div>
        </div>
      </div> -->

        <!-- <h1
        class="aa"
        style="margin-left: 15px; padding-top: 0px; margin-top: 0px"
      >
        Step 4 : Identify the initial signal
      </h1>

      <div style="margin-left: 30px; margin-right: 30px">
        <div class="summary-item">
          <span class="summary-bullet">•</span> -->
        <!-- <div v-if="summaryStep4" class="summary-text-content">
            <span v-html="summaryStep4"></span>
          </div>
          <div v-else class="summary-text-content">
            <span class="dynamic-text">
              (Answer questions 201 and 202 to generate this section.)
            </span>
          </div> -->
        <!-- <div class="summary-text-content">
            <span style="color: red"
              >N/A (Insufficient data. <br />Need : proable initial inducers and
              what they're induce.)</span
            >
          </div>
        </div>
      </div> -->

        <!-- <h1
        class="aa"
        style="margin-left: 15px; padding-top: 0px; margin-top: 0px"
      >
        Step 5 : Establish remission therapy question
      </h1>

      <div style="margin-left: 30px; margin-right: 30px">
        <div class="summary-item">
          <span class="summary-bullet">•</span>
          <div v-if="summaryStep5" class="summary-text-content">
            <span v-html="summaryStep5"></span>
          </div>
          <div v-else class="summary-text-content">
            <span class="dynamic-text">
              (Answer questions A-3 to generate this section.)
            </span>
          </div>
        </div>
      </div> -->

        <h1
          class="aa"
          style="margin-left: 15px; padding-top: 0px; margin-top: 0px"
        >
          Step 6 : Confirm confidentiality level
        </h1>

        <div style="margin-left: 30px; margin-right: 30px">
          <ConfidentialForm />
        </div>
        <br />
      </div>
    </div>
    <div class="btn-container">
      <div v-if="suggestedRoutes.includes('Route C') && !hasNonsenseContradiction" class="preamble-inline">
        <div class="preamble-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            width="16"
            height="16"
          >
            <path
              fill-rule="evenodd"
              d="M8 1.5a6.5 6.5 0 1 0 0 13a6.5 6.5 0 0 0 0-13M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m7.25-2.25a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5a.75.75 0 0 1 .75-.75M8 11a1 1 0 1 1 0-2a1 1 0 0 1 0 2"
            />
          </svg>
        </div>
        <div class="preamble-text-group">
          <div>
            <strong>Contradiction Warning: Re-evaluation Required</strong>
            <p>
              Your responses have identified a significant contradiction within
              the diagnostic criteria or natural history of the disease. This is
              a critical finding, as it challenges the assumption that the
              condition is a single, uniform entity.
            </p>
            <p>
              This suggests that what is currently defined as one disease may,
              in fact, represent a heterogeneous syndrome—a collection of
              distinct pathological processes that converge on similar clinical
              signs. Proceeding with the current data is inadvisable, as it
              could lead to confounding results and a failure to identify the
              true originating cell type(s).
            </p>
            <strong>Recommended Action:</strong>
            <ul>
              <li>
                <strong>Further Research:</strong> Conduct additional
                preclinical or clinical research to gather data that clarifies
                the diagnostic criteria and resolves the observed contradiction.
              </li>
              <li>
                <strong>Re-evaluate Inputs:</strong> Carefully review the
                answers provided in this questionnaire to ensure they are based
                on a consistent and robust set of evidence.
              </li>
            </ul>
            <p style="margin-bottom: 0">
              Resolution of this contradiction is a prerequisite for
              legitimately exploring the originating cell and pursuing a
              high-precision therapeutic strategy.
            </p>
          </div>
        </div>
      </div>

      <div v-if="hasNonsenseStagingTyping" class="preamble-inline">
    <div class="preamble-icon">
       </div>
    <div class="preamble-text-group">
      <div>
        <strong>Logical Inconsistency Detected: Pathway and Classification</strong>
        <p>
          Your responses indicate a mismatch. You confirmed evidence for a shared pathway with distinct triggers (Question 104), which logically requires a classification of "staging and typing" (for Route H) or "typing only" (for Route G).
        </p>
        <p>
          However, your selection for disease classification (Question 201) does not align with this evidence. Please re-evaluate your inputs to ensure consistency.
        </p>
      </div>
    </div>
  </div>

  <div v-if="hasNonsenseContradiction" class="preamble-inline">
    <div class="preamble-icon">
       </div>
    <div class="preamble-text-group">
      <div>
        <strong>Logical Inconsistency Detected: Diagnostic Criteria</strong>
        <p>
          Your responses are contradictory. You stated that there are no defined criteria for diagnosis (Question 202), but then identified a contradiction within those same criteria (Question 203).
        </p>
        <p>
          This indicates a fundamental inconsistency in the provided data. Please re-evaluate your inputs or conduct further research to establish a clear and non-contradictory set of diagnostic criteria before proceeding.
        </p>
      </div>
    </div>
  </div>


      <button type="button" class="edit-btn" @click="editAnswers">
        Edit answer
      </button>
      <button
        v-if="!suggestedRoutes.includes('Route C')"
        type="button"
        class="submit-btn"
        @click="submitFinalResponse"
        :disabled="!isConfidentialFormComplete"
      >
        Save
      </button>

      <button v-else type="button" class="submit-btn" @click="startNewSurvey">
        Reset form
      </button>

      <!-- <button type="button" class="export-btn" @click="startNewSurvey">
          Export to pdf
        </button> -->

      <div v-if="submissionSuccess" class="modal">
        <div class="modal-content">
          <h3 class="h3">Data saved successfully.</h3>
          <p>Your information has been saved successfully.</p>
          <div class="modal-buttons">
            <!-- <button @click="goToHome" class="btn btn-primary">กลับสู่หน้าหลัก</button> -->
            <button @click="startNewSurvey" class="btn btn-primary">
              Submit another response.
            </button>
          </div>
        </div>
      </div>

      <div v-if="submissionError" class="modal">
        <div class="modal-content">
          <h3 class="h3">An error occurred.</h3>
          <p>There was a problem saving your information. Please try again.</p>
          <button @click="submissionError = false" class="btn btn-primary">
            Close
          </button>
        </div>
      </div>
    </div>
    <a
      style="color: #eb4648; cursor: pointer; margin-left: 24px"
      @click="exportToPdf"
    >
      Export to .pdf here
    </a>
  </div>
</template>
<style scoped>
.questionnaire {
  padding-left: 16px;
  padding-right: 16px;
}

.title {
  font-weight: 400;
  padding: 8px 0px;
  font-size: 20px;
  line-height: 24px;
  margin-bottom: 16px;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section {
  border: none;
}

.p {
  padding: 8px;
  margin-top: 24px;
  margin-bottom: 24px;
}

.edit-btn {
  height: 100%;
  width: 188px;
  background-color: white;
  color: #eb4648;
  padding: 8px;
  border: 1px solid #eb4648;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 8px;
  margin-right: 16px;
}

.edit-btn:hover {
  background-color: #e3e3e3;
}

.section-title {
  font-size: 20px;
  font-weight: 400;
  padding: 0;
  margin: 0px 0px 24px 0px;
  border: none;
}

.aa {
  margin-top: 10px;
  margin-bottom: 10px;
  padding-top: 8px;
  padding-bottom: 8px;
  font-size: 20px;
  font-weight: 400;
  line-height: 24px;
}

.h3 {
  padding-top: 8px;
  padding-bottom: 8px;
  font-size: 20px;
  font-weight: 400;
  line-height: 24px;
}

.question {
  margin: 0 !important;
  padding-top: 0px;
  padding-bottom: 0px;
  padding-left: 16px;
  padding-right: 16px;
}

.question.no-margin {
  margin-bottom: 0 !important;
}

.no-margin {
  margin: 0 !important;
}

.padding-left {
  padding-right: 0px !important;
  padding-left: 16px !important;
}

.padding-right {
  padding-right: 16px !important;
}

.question-label {
  margin-bottom: 4px;
  font-size: 18px;
  display: block;
  padding: 8px;
  color: #000000;
}

.input-text {
  font-size: 18px;
  margin-bottom: 24px;
  width: 100%;
  padding: 8px;
  border: 1px solid #a4a4a4;
  border-radius: 4px;
}

.radio-group,
.checkbox-group {
  display: flex;
  flex-direction: column;
}

.radio-option,
.checkbox-option {
  font-size: 18px;
  padding: 0px 8px;
  display: flex;
  align-items: center;
  margin: 12px 0px;
  gap: 10px;
}

.radio-input,
.checkbox-input {
  accent-color: #eb4648;
  cursor: pointer;
}

.submit-btn {
  height: 100%;
  width: 188px;
  background-color: #eb4648;
  color: white;
  padding: 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.submit-btn:hover {
  background-color: #c9302c;
}

.submit-btn:disabled {
  background-color: #cccccc;
  color: #6c757d;
  cursor: not-allowed;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  max-width: 400px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  align-items: center;
}

.modal-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
}

.home-btn {
  background-color: #4caf50;
  color: white;
  padding: 10px 15px;
  border: none;
  cursor: pointer;
}

.new-survey-btn {
  background-color: #f0ad4e;
  color: white;
  padding: 10px 15px;
  border: none;
  cursor: pointer;
}

.close-btn {
  background-color: #d9534f;
  color: white;
  padding: 10px 15px;
  border: none;
  cursor: pointer;
}

.final-review {
  padding-bottom: 50px;
}
.questionnaire {
  padding: 16px;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
}
.answer-block {
  margin-bottom: 24px;
}
.question-label {
  font-size: 18px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}
.answer-text,
.answer-block ul {
  font-size: 16px;
  color: #555;
  margin-left: 16px;
}
.sub-answer-block {
  margin-left: 32px;
  margin-top: 10px;
  padding-left: 15px;
  border-left: 2px solid #f0f0f0;
}
.final-route-text {
  color: #eb4648;
  font-weight: bold;
}
/* Other styles remain the same */
.aa {
  font-size: 20px;
  font-weight: 400;
}
.btn-container {
  padding: 16px;
}
/* Add these styles to your <style scoped> block */

.summary-item {
  display: flex; /* Aligns bullet and text */
  gap: 8px;
  padding-bottom: 1rem;
  line-height: 1.6;
}

.summary-bullet {
  font-weight: bold;
  color: #eb4648;
}

/* Class for dynamic text like the disease name */
.dynamic-text {
  color: #555;
  font-style: italic;
  font-weight: 500;
}

/* Class for the entire decision sentence */
.decision-sentence {
  color: #555;
  display: block; /* Puts it on its own line */
  margin-top: 4px;
}

/* Class for the route name itself */
/* .route-name {
  color: #d84315;
  font-weight: bold;
} */

/* Class for positive decision words */
.decision-words-positive {
  color: #28a745; /* Green */
  font-weight: bold;
}

/* Class for negative decision words */
.decision-words-negative {
  color: #d84315; /* Red */
  font-weight: bold;
}
/* Styles for the dynamic summary paragraphs */
.summary-item {
  display: flex;
  gap: 8px;
  padding-bottom: 1rem;
  line-height: 1.6;
}

.summary-bullet {
  font-weight: bold;
  color: #eb4648;
}

/* Dynamic text like the disease name */
.dynamic-text {
  color: #555;
  font-style: italic;
  font-weight: 500;
}

/* The entire decision sentence */
.decision-sentence {
  color: #555; /* Gray color */
  display: block;
  margin-top: 4px;
}

/* The route name itself */
.route-name {
  color: #d84315; /* Red */
  font-weight: bold;
}

/* The decision words (e.g., "not to pursue", "justifies choosing") */
.decision-words {
  color: #d84315; /* Red */
  font-weight: bold;
}
</style>

<style>
/* These are now global styles that can affect v-html content */

.summary-item {
  display: flex;
  gap: 8px;
  padding-bottom: 1rem;
  line-height: 1.6;
}

.summary-bullet {
  font-weight: bold;
  color: #eb4648;
}

/* Dynamic text like the disease name */
.dynamic-text {
  color: #555;
  font-style: italic;
  font-weight: 500;
}

/* The entire decision sentence will be gray */
.decision-sentence {
  color: #555;
  display: block;
  margin-top: 4px;
}

/* The route name itself will be red */
.route-name {
  color: #d84315;
  font-weight: bold;
}

/* The decision words will be red */
.decision-words {
  color: #d84315;
  font-weight: bold;
}
.preamble-inline {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background-color: #fbe9e7; /* Light pink/red background */
  color: #5d4037; /* Darker text for readability */
  border: 1px solid #ffab91; /* Reddish border */
  border-radius: 8px;
  padding: 16px;
  margin: 0 8px 1.5rem 8px;
}

.preamble-icon {
  /* margin-top: 2px; */
  flex-shrink: 0;
  color: #d84315; /* Red icon color */
}

.preamble-text {
  font-size: 16px;
  line-height: 1.5;
}

.preamble-text strong {
  font-weight: 600;
}
</style>
