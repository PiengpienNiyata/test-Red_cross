<template>
  <div>
    <Header />
    <router-view />
  </div>
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <div class="container">
        <router-link to="/" class="navbar-brand">Home</router-link>
        <!-- <router-link to="/questionnairesResearcher" class="nav-link">Questionnaire</router-link> -->
      </div>
    </nav>
</template>

<script>
import Header from "@/components/Header.vue";

export default {
  components: {
    Header,
  },
};
</script>