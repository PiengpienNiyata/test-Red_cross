<template>
  <div class="sidebar d-flex flex-column">
    <div class="sidebar-item">
      <div class="sidebar-item-2" @click="$router.push('/questionnairesResearcher')">
        <img src="@/assets/icon1.png" alt="icon" class="icon">
        <span class="text-danger">แบบสอบถาม</span>
      </div>
    </div>
    <div class="divider"></div>

    <div class="sidebar-item">
      <div class="sidebar-item-2" @click="$router.push('/questionnairesResearcher2')">
        <img src="@/assets/icon2.png" alt="icon" class="icon">
        <span>Explore the<br>precision <br>intervention</span>
      </div>

    </div>
    <div class="divider"></div>

    <div class="sidebar-item">
      <div class="sidebar-item-2" @click="$router.push('/questionnairesResearcher3')">
      <img src="@/assets/icon3.png" alt="icon" class="icon">
      <span>รอตรวจสอบ</span>
    </div>
  </div>
  </div>
</template>

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