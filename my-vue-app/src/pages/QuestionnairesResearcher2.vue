<!-- 2 -->

<script setup lang="ts">
import QuestionnairesForm from "@/components/QuestionnairesForm2.vue";
import { questionnaireData } from "@/stores/questionnairesResearcher2";

const questionnairesResearcher = questionnaireData[0];
</script>

<template>
  <QuestionnairesForm :questionnaire="questionnairesResearcher" />
</template>
