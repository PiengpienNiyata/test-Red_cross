<template>
  <header class="header">
    <div class="logo_bg">
      <img src="@/assets/LOGO_red_cross.png" alt="Logo" class="logo" />
    </div>
  </header>
</template>

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

.logo {
  width: 128px !important;
  height: 94px !important;
}

</style>
