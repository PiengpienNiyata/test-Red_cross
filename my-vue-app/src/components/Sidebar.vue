<template>
  <div class="sidebar d-flex flex-column">
    <div class="sidebar-item">
      <img src="@/assets/icon1.png" alt="icon" class="icon">
      <span class="text-danger">แบบสอบถาม</span>
    </div>
    <div class="divider"></div>

    <div class="sidebar-item">
      <img src="@/assets/icon2.png" alt="icon" class="icon">
      <span>บันทึก<br>รายละเอียด<br>โครงการ</span>
    </div>
    <div class="divider"></div>

    <div class="sidebar-item">
      <img src="@/assets/icon3.png" alt="icon" class="icon">
      <span>List Item</span>
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
  max-height: 100px;
  display: flex;
  align-items: center;
  padding: 8px;
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

.span{
  text-align: left;
  font-size: 18px;
}
</style>