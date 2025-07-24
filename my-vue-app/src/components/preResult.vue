<script setup lang="ts">
import { defineProps, defineEmits } from "vue";

const props = defineProps<{ lastQuestion?: string }>();
const emit = defineEmits(["continue"]);
</script>

<template>
  <div class="pre-result">
    <p v-if="props.lastQuestion" class="p">
      match number: <span :style="{ color: '#EB4648' }">{{ props.lastQuestion }}</span>
    </p>


    <button type="button" class="btn" @click="emit('continue')">continue</button>
  </div>
</template>

<style>
.pre-result {
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
  background-color: #EB4648;
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