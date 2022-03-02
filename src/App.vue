<template>
  <div id="app">
    <VideoInteractive />
  </div>
</template>

<script>
import VideoInteractive from "./components/VideoInteractive.vue";
export default {
  name: "app",
  components: {
    VideoInteractive,
  },
};
</script>

<style>
body {
  margin: 0;
}
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
