<script setup lang="ts">
import { defineProps, defineEmits, computed } from "vue";

const props = defineProps<{ route: string; lastQuestion?: string }>();
const emit = defineEmits(["save"]);

const sortedRoute = computed(() => {
  if (!props.route || !props.route.includes("Route")) {
    return props.route;
  }
  return props.route.split(", ").sort().join(", ");
});
</script>

<template>
  <div class="final-result">
    <p class="p" v-if="props.route.includes('Route')">
      Route Suggestions :
      <span :style="{ color: '#EB4648' }">{{ props.route }}</span>
    </p>
    <div class="p" v-else>
      <div :style="{ color: '#EB4648' }">No route available.</div>
      <div style="font-style: italic; color: #6c757d">
        (click "Show summary" button to see the explanation)
      </div>
    </div>
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
