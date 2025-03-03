<script setup lang="ts">
import { defineProps, defineEmits } from "vue";

const props = defineProps<{ route: string }>();
const emit = defineEmits(["save"]);
</script>

<template>
  <div class="final-result">
    <h4>แบบสอบถามเสร็จสมบูรณ์</h4>
    <p>เส้นทางที่ได้รับ: {{ props.route }}</p>
    <button @click="emit('save')">บันทึกผลลัพธ์</button>
  </div>
</template>