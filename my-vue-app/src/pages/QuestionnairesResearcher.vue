<script setup lang="ts">
import QuestionnairesForm from "@/components/QuestionnairesForm.vue";
import { questionnaireData } from "@/stores/questionnairesResearcher";

const questionnairesResearcher = questionnaireData[0];
</script>

<template>
  <QuestionnairesForm :questionnaire="questionnairesResearcher" />
</template>
