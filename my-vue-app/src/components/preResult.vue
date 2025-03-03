<script setup lang="ts">
import { defineProps, defineEmits } from "vue";

const props = defineProps<{ lastQuestion?: string }>();
const emit = defineEmits(["continue"]);
</script>

<template>
  <div class="pre-result">
    <h4>คุณเลือก "ไม่แน่ใจ" ในคำถามล่าสุด</h4>
    <p v-if="props.lastQuestion">คำถามล่าสุดที่ตอบ: {{ props.lastQuestion }}</p>
    <button @click="emit('continue')">ดำเนินการต่อ</button>
  </div>
</template>
