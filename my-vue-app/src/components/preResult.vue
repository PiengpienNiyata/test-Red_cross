<script setup lang="ts">
import { defineProps, defineEmits } from "vue";

const props = defineProps<{ lastQuestion?: string }>();
const emit = defineEmits(["continue"]);
</script>

<template>
  <div class="pre-result">
    <h4>คุณเลือก "ไม่แน่ใจ" ในคำถามล่าสุด</h4>
    <p v-if="props.lastQuestion">คำถามล่าสุดที่ตอบ: {{ props.lastQuestion }}</p>
    <button type="button" class="btn" @click="emit('continue')">ดำเนินการต่อ</button>
  </div>
</template>

<style >
.pre-result{
  
}
.btn{
  height: 100%;
  width: 144px;
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