<template>
  <div class="app-container min-h-screen bg-white text-black">
    <router-view />
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.app-container {
  max-width: 480px;
  margin: 0 auto;
  min-height: 100vh;
  position: relative;
}
</style>
