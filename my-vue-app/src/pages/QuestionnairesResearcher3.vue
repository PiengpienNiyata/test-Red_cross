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

const store = useQuestionnaireStore();
const router = useRouter();

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

// const finalRoute = store.finalRoute;
const { suggestedRoutes } = storeToRefs(store);

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
    // --- Step 1: Validate Researcher Info ---
    store.processResearcherInfo(store.answers as Record<string, string>);
    const { name, project_name, branch_info, phone_number, email } =
      store.researcher;
    if (!name || !project_name || !branch_info || !phone_number || !email) {
      alert("Please fill in all researcher details before submitting!");
      return;
    }

    // --- Step 2: Create Researcher Record (if needed) ---
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

    // --- Step 3: Separate Answers into Different Payloads ---
    const fileAnswersToUpload: { questionId: string; file: File }[] = [];
    const otherAnswers: Record<string, any> = {};
    const researchContext: Record<string, any> = {
      research_questions: {},
      molecular_signaling: {},
    };

    Object.entries(store.answers).forEach(([id, value]) => {
      // Find and separate file objects for later upload
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

      // Separate out the research context answers
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
      } else {
        // Everything else is a "regular" answer
        otherAnswers[id] = value;
      }
    });

    // --- Step 4: Create the Main Response Record ---
    const response = await fetch(`${VITE_API_BASE_URL}/api/response`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        researcher_id: researcherID,
        questionnaire_id: 1,
        answers: otherAnswers,
        final_route: suggestedRoutes.value.join(", ") || "unknown",
        disease_name: store.answers[1006] || "",
        intervention: store.answers[1007] || "",
        research_context: researchContext,
      }),
    });

    const responseResult = await response.json();
    if (!response.ok) throw new Error("Failed to save response");
    const responseID = responseResult.id;

    // --- Step 5: Upload All Files ---
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

      // Wait for all file uploads to complete
      const uploadResults = await Promise.all(uploadPromises);
      const failedUpload = uploadResults.find((res) => !res.ok);
      if (failedUpload) {
        throw new Error(`Failed to upload file: ${await failedUpload.text()}`);
      }
    }

    // --- Step 6: Show Success ---
    submissionSuccess.value = true;
  } catch (error) {
    console.error("Error submitting data:", error);
    submissionError.value = true;
  }
};

const startNewSurvey = () => {
  store.resetStore();
  router.push("/questionnairesResearcher");
};

const createObjectURL = (file: File) => {
  return URL.createObjectURL(file);
};
</script>

<template>
  <div class="final-review">
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

            <!-- <div v-if="(q.answer as any).subs" class="sub-answer-block"> -->

            <!-- </div> -->

            <div v-if="(q.answer as any).fileData" class="sub-answer-block">
              <strong>Attached Files:</strong>
              <ul>
                <li
                  v-for="(fileInfo, key) in (q.answer as any).fileData"
                  :key="key"
                >
                  <!-- {{ key }}: -->
                  <span
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
            <ul>
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
            </ul>
          </div>
        </div>
      </div>

      <p class="p" v-if="suggestedRoutes.length > 0">
        Road Map Suggestion:
        <span class="final-route-text">{{ suggestedRoutes.join(", ") }}</span>
      </p>
    </div>

    <div class="questionnaire">
      <h1 class="aa" style="padding-top: 0px; margin-top: 0px">
        Step 1 : Choose the legitimated route to explore for the originating
        cell
      </h1>
      <li v-if="store.answers[102] === 'No'">
        Based on A2 : Availability of remission result at the rate of 80%, your
        answer is "No", it supports the dicision
        <span class="color: red;">not to pursue route A</span>
      </li>
      <li v-else>
        Based on A2 : Availability of remission result at the rate of 80%, your
        answer is "Yes", it supports the dicision
        <span class="color: red;">to pursue route A</span>
      </li>
    </div>
    <br style="padding-bottom: 0px" />
    <h1 class="aa" style="margin-left: 15px; padding-top: 0px; margin-top: 0px">
      Step 6 : Confirm confidentiality level
    </h1>

    <div style="margin-left: 30px">
      <ConfidentialForm />
    </div>
    <br />
    <div class="btn-container">
      <button type="button" class="edit-btn" @click="editAnswers">
        แก้ไขข้อมูล
      </button>
      <button type="button" class="submit-btn" @click="submitFinalResponse">
        บันทึก
      </button>

      <div v-if="submissionSuccess" class="modal">
        <div class="modal-content">
          <h3 class="h3">บันทึกข้อมูลสำเร็จ</h3>
          <p>ข้อมูลของคุณได้รับการบันทึกเรียบร้อยแล้ว</p>
          <div class="modal-buttons">
            <!-- <button @click="goToHome" class="btn btn-primary">กลับสู่หน้าหลัก</button> -->
            <button @click="startNewSurvey" class="btn btn-primary">
              ส่งคำตอบเพิ่ม
            </button>
          </div>
        </div>
      </div>

      <div v-if="submissionError" class="modal">
        <div class="modal-content">
          <h3 class="h3">เกิดข้อผิดพลาด</h3>
          <p>เกิดปัญหาในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง</p>
          <button @click="submissionError = false" class="btn btn-primary">
            ปิด
          </button>
        </div>
      </div>
    </div>
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
</style>
