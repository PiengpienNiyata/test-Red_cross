<script setup lang="ts">
import { defineProps, defineEmits } from "vue";

const props = defineProps<{ route: string }>();
const emit = defineEmits(["save"]);
</script>

<template>
  <div class="final-result" >
    <p class="p">Result Road Map: <span :style="{ color: '#EB4648' }">{{ props.route }}</span></p>
    <button class="btn" @click="emit('save') ">บันทึกผลลัพธ์</button>
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