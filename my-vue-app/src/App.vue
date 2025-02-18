<template>
  <div class="app-container">
    <Header />

    <div class="content-wrapper">
      <div class="content-section">
        <h1 class="section-title">header</h1>

        <div class="content-body">
          <Sidebar />
          <div class="page-content">
            <router-view />
          </div>
        </div>
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

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.content-wrapper {
  max-height: calc(100vh - 20px);
  box-shadow: 0px 0px 2px 0px #00000040;
  border-radius: 8px;
  margin: 26px 24px 63px 24px;
  display: flex;
  flex-direction: column;
}

.section-title {
  color: #000;
  display: flex;
  margin: 16px 24px;
  padding-top: 8px;
  padding-bottom: 8px;
  font-size: 20px;
  font-weight: 400;
  line-height: 24px;
  border-bottom: 1px dashed #ccc;
}

.content-section {
  display: flex;
  flex-direction: column;
}

.content-body {
  display: flex;
  width: 100%;
  align-items: flex-start;

}

.sidebar {
  height: calc(100vh - 250px);
  width: 230px;
  background-color: #fff;
  border-right: 1px dashed #ccc;
}

.page-content {
  flex: 1;
  background-color: #fff;
  overflow-y: auto;
  overflow-x: hidden;
  max-height: calc(100vh - 250px);
  padding-bottom: 20px;
}
</style>
