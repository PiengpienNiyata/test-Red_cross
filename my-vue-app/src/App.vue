<template>
  <div class="app-container">
    <!-- Sidebar (Sticky Left) -->
    <Sidebar />

    <div class="main-content">
      <!-- Header at the Top -->
      <Header />

      <!-- Page Content (Routed View) -->
      <div class="page-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from "@/components/Sidebar.vue";
import Header from "@/components/Header.vue";
import "@/assets/main.css"; // Global styles

export default {
  components: {
    Sidebar,
    Header,
  },
};
</script>

<style>
/* Main Container */
.app-container {
  display: flex;
}

.header{
  position: fixed;
}
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  width: 230px;
  height: 100vh;
  background-color: #fff;
  border-right: 1px solid #ccc;
}

/* Main content area */
.main-content {
  margin-left: 230px;
  width: calc(100% - 230px);
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.page-content {
  margin-top: 142px;
  flex: 1;
  padding: 20px;
  background-color: #f8f9fa; /* Light background */
}
</style>
