<template>
  <div class="sidebar d-flex flex-column">
    <div class="sidebar-item">
      <div 
        class="sidebar-item-2" 
        :style="{ color: isActive('/questionnairesResearcher') ? '#EB4648' : '#A4A4A4' }"
      ><!--@click="$router.push('/questionnairesResearcher')" @click="$router.push('/questionnairesResearcher2')" @click="$router.push('/questionnairesResearcher3')"-->

      <img :src="isActive('/questionnairesResearcher') ? icon1 : icon2" alt="icon" class="icon" />
      <span style="text-align: center;">Questionnaire</span>
      </div>
    </div>
    <div class="divider"></div>

    <div class="sidebar-item">
      <div 
        class="sidebar-item-2" 
        
        :style="{ color: isActive('/questionnairesResearcher2') ? '#EB4648' : '#A4A4A4' }"
      >
      <img :src="isActive('/questionnairesResearcher2') ? icon1 : icon2" alt="icon" class="icon" />
      <span style="text-align: center;">Explore the<br>precision <br>intervention</span>
      </div>
    </div>
    <div class="divider"></div>

    <div class="sidebar-item">
      <div 
        class="sidebar-item-2" 
        :style="{ color: isActive('/questionnairesResearcher3') ? '#EB4648' : '#A4A4A4' }"
      >
      <img :src="isActive('/questionnairesResearcher3') ? icon4 : icon3" alt="icon" class="icon" />
      <span style="display: inline-block; width: 80px; text-align: center;">Verify information</span>
      </div>
    </div>
  </div>
</template>
<script setup>
import icon1 from '@/assets/icon1.png';
import icon2 from '@/assets/icon2.png';
import icon3 from '@/assets/icon3.png';
import icon4 from '@/assets/icon4.png';
</script>
<script>
export default {
  computed: {
    currentRoute() {
      return this.$route.path;
    }
  },
  methods: {
    isActive(route) {
      return this.currentRoute === route;
    }
  }
};
</script>

<style scoped>
.sidebar {
  width: 206px;
  align-items: center;
  background-color: #fff;
  border-right: 1px dashed #ccc;
  text-align: left;
}

.sidebar-item {
  /* cursor: pointer; */
  max-height: 100px;
  display: flex;
  width: 200px;
  padding: 8px;
  justify-content: space-evenly;
}

.sidebar-item-2 {
  max-width: 160px;
  /* cursor: pointer; */
  cursor: default;
  max-height: 100px;
  display: flex;
  align-items: center;
}


.icon {
  width: 40px;
  height: 40px;
  margin-right: 8px;
}

.divider {
  height: 64px;
  border-left: 1px dotted #999;
  margin: 11px;
}

.span {
  text-align: left;
  font-size: 18px;
}
</style>
