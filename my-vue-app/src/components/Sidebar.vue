<template>
    <div class="sidebar d-flex flex-column">
      <!-- Logo Section -->
      <div class="logo_bg d-flex align-items-center justify-content-center">
        <img src="@/assets/LOGO_red_cross.png" alt="Logo" class="logo" />
      </div>
  
      <!-- Navigation Section -->
      <div class="all_info d-flex flex-row flex-grow-1">
        <!-- Red Stripe -->
        <div class="red_stripe d-flex flex-column align-items-center py-3">
          <i class="bi bi-person-fill text-white mb-3"></i>
          <i class="bi bi-clock text-white"></i>
        </div>
  
        <!-- Menu Items -->
        <div class="menu d-flex flex-column justify-content-center">
          <a href="#" class="nav-link">Questionnaire</a>
          <a href="#" class="nav-link">History</a>
        </div>
      </div>
  
      <!-- Logout Button -->
      <div class="logout d-flex align-items-center justify-content-between px-3">
        <i class="bi bi-person-circle"></i>
        <span>Staff Name</span>
        <i class="bi bi-box-arrow-right"></i>
      </div>
    </div>
  </template>
  
  <script>
  import 'bootstrap-icons/font/bootstrap-icons.css';
  
  export default {
    name: "Sidebar",
  };
  </script>
  
  <style scoped>
  /* Sidebar */
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    width: 230px;
    height: 100vh;
    background-color: #fff;
    border-right: 1px solid #ccc;
  }
  
  /* Logo Section */
  .logo_bg {
    background-color: white;
    padding: 16px 0;
  }
  
  .logo {
    width: 139px;
    height: 94px;
  }
  
  /* Red Stripe */
  .red_stripe {
    width: 48px;
    background-color: #E53935;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
  }
  
  /* Menu */
  .menu .nav-link {
    color: black;
    font-size: 18px;
    padding-left: 16px;
  }
  
  /* Logout Section */
  .logout {
    height: 40px;
    background-color: #f4f4f4;
  }
  </style>
  