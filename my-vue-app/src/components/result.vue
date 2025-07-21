<script setup lang="ts">
import { defineProps, defineEmits } from "vue";
// import { useQuestionnaireStore } from "@/stores/useQuestionnaireStore";

const props = defineProps<{ route: string, lastQuestion?: string }>();
// const store = useQuestionnaireStore();

const emit = defineEmits(["save"]);
</script>

<template>
  <div class="final-result">
    <p class="p" v-if="props.route.includes('Route')">
      Road Map Suggestions :
      <span :style="{ color: '#EB4648' }">{{ props.route }}</span>
    </p>
    <p class="p" v-else>
      Suggestion: <span :style="{ color: '#EB4648' }">{{ props.lastQuestion }}</span>
    </p>
    <button class="btn" @click="emit('save')">Show summary</button>
  </div>
</template>

<style>
.final-result {
  margin-top: 64px;
}

.p {
  font-size: 20px;
  padding: 8px;
}

.btn {
  margin-left: 2px;
  margin-top: 68px;
  height: 100%;
  width: 188px;
  background-color: #eb4648;
  color: white;
  padding: 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn:hover {
  background-color: #c9302c;
}
</style>
