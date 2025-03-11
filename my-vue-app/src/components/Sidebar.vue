<template>
  <div class="sidebar d-flex flex-column">
    <div class="sidebar-item">
      <div 
        class="sidebar-item-2" 
        :style="{ color: isActive('/questionnairesResearcher') ? '#EB4648' : '#A4A4A4' }"
      ><!--@click="$router.push('/questionnairesResearcher')" @click="$router.push('/questionnairesResearcher2')" @click="$router.push('/questionnairesResearcher3')"-->

        <img :src="isActive('/questionnairesResearcher') ? '/src/assets/icon1.png' : '/src/assets/icon2.png'" alt="icon" class="icon">
        <span>แบบสอบถาม</span>
      </div>
    </div>
    <div class="divider"></div>

    <div class="sidebar-item">
      <div 
        class="sidebar-item-2" 
        
        :style="{ color: isActive('/questionnairesResearcher2') ? '#EB4648' : '#A4A4A4' }"
      >
        <img :src="isActive('/questionnairesResearcher2') ? '/src/assets/icon1.png' : '/src/assets/icon2.png'" alt="icon" class="icon">
        <span>Explore the<br>precision <br>intervention</span>
      </div>
    </div>
    <div class="divider"></div>

    <div class="sidebar-item">
      <div 
        class="sidebar-item-2" 
        :style="{ color: isActive('/questionnairesResearcher3') ? '#EB4648' : '#A4A4A4' }"
      >
        <img :src="isActive('/questionnairesResearcher3') ? '/src/assets/icon4.png' : '/src/assets/icon3.png'" alt="icon" class="icon">
        <span>รอตรวจสอบ</span>
      </div>
    </div>
  </div>
</template>

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
  cursor: pointer;
  max-height: 100px;
  display: flex;
  align-items: center;
  padding: 8px;
}

.sidebar-item-2 {
  cursor: pointer;
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
