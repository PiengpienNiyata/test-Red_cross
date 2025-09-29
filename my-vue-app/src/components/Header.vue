<template>
  <header class="header">
   
    <div v-if="isQuestionnaire1" class="logo_bg">
      <div class="logotxt">RESEARCHER</div>
    </div>
    <div v-else-if="isQuestionnaire2" class="logo_bg">
      <div class="logotxt">RIRM</div>
    </div>
     <div v-else class="logo_bg">
      <img src="@/assets/LOGO_red_cross.png" alt="Logo" class="logo" />
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from "vue-router";
const route = useRoute();

const isQuestionnaire1 = computed(() => route.path === "/questionnairesResearcher");
const isQuestionnaire2 = computed(() => route.path === "/questionnairesResearcher2");

</script>

<style scoped>
.header {
  width: 100%;
  height: 120px;
  background: linear-gradient(to right, #EB4648, #F28A8B, #F49899, #FFFFFF);
  display: flex;
  align-items: center;
  position: relative; 
  z-index: 1000;
}

.logo_bg {
  width: 230px;
  background-color: white;
  padding: 16px;
  display: flex; 
  justify-content: center; 
  align-items: center; 
}

.logo, .logotxt {
  width: 128px !important;
  height: 94px !important;
}

.logotxt {
  display: flex;                /* use flexbox */
  justify-content: center;      /* horizontal center */
  align-items: center;          /* vertical center */

  font-size: 24px;              /* increase size */
  font-weight: 400;             /* bold */
}

</style>
