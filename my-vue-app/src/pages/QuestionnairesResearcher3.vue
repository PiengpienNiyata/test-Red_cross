<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useQuestionnaireStore } from "@/stores/useQuestionnaireStore";
import { useRouter } from "vue-router";
import { questionnaireData } from "@/stores/questionnairesResearcher";
import { questionnaireData as questionnaireData2 } from "@/stores/questionnairesResearcher2";
import type { Question2 } from "@/stores/questionnairesResearcher2";

const store = useQuestionnaireStore();
const router = useRouter();

const getQuestionById = (id: number): Question2 | null => {
  for (const section of questionnaireData[0].sections) {
    const foundQuestion = section.questions.find((q) => q.id === id);
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
      .filter(([id]) => Number(id) >= 11001)
      .map(([id, answer]) => {
        const question = getQuestionById2(Number(id));
        return question ? { ...question, answer } : null;
      })
      .filter((q) => q !== null) as Question2[]
);

const finalRoute = store.finalRoute;

const editAnswers = () => {
  store.resetServey();
  router.push("/questionnairesResearcher");
};

const submissionSuccess = ref(false);
const submissionError = ref(false);

const submitFinalResponse = async () => {
  try {
    store.setResearcher({
      name: store.answers[1001] || "",
      project_name: store.answers[1002] || "",
      branch_info: store.answers[1003] || "",
      phone_number: store.answers[1004] || "",
      email: store.answers[1005] || "",
    });

    const { name, project_name, branch_info, phone_number, email } =
      store.researcher;

    if (!name || !project_name || !branch_info || !phone_number || !email) {
      alert("Please fill in all researcher details before submitting!");
      return;
    }

    let researcherID = store.researcherID;

    if (!researcherID) {
      const researcherResponse = await fetch(
        "http://localhost:8080/api/researcher",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            project_name,
            branch_info,
            phone_number,
            email,
          }),
        }
      );

      const researcherResult = await researcherResponse.json();
      if (!researcherResponse.ok) {
        console.error("Failed to save researcher data:", researcherResult);
        submissionError.value = true;
        return;
      }

      researcherID = researcherResult.researcher.id;
      store.setResearcherID(researcherID);
    }

    const answersData: Record<string, string | string[]> = {};
    const surveyData: Record<string, string | string[]> = {};

    Object.entries(store.answers).forEach(([id, value]) => {
      const numericId = Number(id);
      if (numericId >= 1001 && numericId <= 1014) {
        answersData[id] = value;
      } else if (numericId >= 11001) {
        surveyData[id] = value;
      }
    });

    const response = await fetch("http://localhost:8080/api/response", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        researcher_id: researcherID,
        questionnaire_id: 1,
        answers: answersData,
        survey: surveyData,
        final_route: store.finalRoute,
      }),
    });

    const responseResult = await response.json();
    if (response.ok) {
      submissionSuccess.value = true;
    } else {
      console.error("Failed to save response:", responseResult);
      submissionError.value = true;
    }
  } catch (error) {
    console.error("Error submitting data:", error);
    submissionError.value = true;
  }
};

const startNewSurvey = () => {
  store.resetStore();
  router.push("/questionnairesResearcher");
};
const goToHome = () => {
  store.resetStore();
  router.push("/");
};
</script>

<template>

  <div class="final-review">

    <div class="questionnaire">
      <div class="row">
        <div v-for="q in firstFormAnswers" :key="q.id" :class="{
          
          'col-md-6': q.id === 1001 || q.id === 1002 || q.id === 1004 || q.id === 1005,
          'col-md-12': q.id === 1003,
          'no-margin': q.id >= 1001 && q.id <= 1005,
        }">
        
          <label class="question-label">{{ q.question }}</label>

          <input v-if="q.type === 'text'" :value="q.answer" type="text" class="input-text" disabled />


          <div v-else-if="q.type === 'radio'" class="radio-group">
            <div v-for="option in q.options" :key="option" class="radio-option">
              <input type="radio" :name="'q' + q.id" :value="option" :checked="q.answer === option" class="radio-input"
                disabled />
              <label class="radio-label">{{ option }}</label>
            </div>
          </div>

          <div v-else-if="q.type === 'checkbox'" class="checkbox-group">
            <div v-for="option in q.options" :key="option" class="checkbox-option">
              <input type="checkbox" :value="option" :checked="(q.answer || []).includes(option)" class="checkbox-input"
                disabled />
              <label class="checkbox-label">{{ option }}</label>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="questionnaire">
      <h3 class="aa">Explore the precision intervention</h3>

      <div v-for="q in secondFormAnswers" :key="q.id">
        <label class="question-label">{{ q.question }}</label>

        <div v-if="q.type === 'radio'" class="radio-group">
          <div v-for="option in q.options" :key="option" class="radio-option">
            <input type="radio" :name="'q' + q.id" :value="option" :checked="q.answer === option" class="radio-input"
              disabled />
            <label class="radio-label">{{ option }}</label>
          </div>
        </div>
      </div>
      <p class="p">Result Road Map: <span :style="{ color: '#EB4648' }">{{ finalRoute }}</span></p>      
    </div>

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
            <button @click="goToHome" class="btn btn-primary">กลับสู่หน้าหลัก</button>
            <button @click="startNewSurvey" class="btn btn-primary">ส่งคำตอบเพิ่ม</button>
          </div>
        </div>
      </div>

      <div v-if="submissionError" class="modal">
        <div class="modal-content">
          <h3 class="h3">เกิดข้อผิดพลาด</h3>
          <p>เกิดปัญหาในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง</p>
          <button @click="submissionError = false" class="btn btn-primary">ปิด</button>
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

.p{
  padding: 8px;
  margin-top: 24px ;
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
.aa{
  margin-top: 10px;
  margin-bottom: 10px;
  padding-top: 8px;
  padding-bottom: 8px;
  font-size: 20px;
  font-weight: 400;
  line-height: 24px;
}

.h3{  padding-top: 8px;
  padding-bottom: 8px;
  font-size: 20px;
  font-weight: 400;
  line-height: 24px;}

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
  background-color: white;
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
  background: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}

.modal-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
}

.home-btn {
  background-color: #4CAF50;
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
</style>
