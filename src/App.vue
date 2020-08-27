<template>
  <div id="app">
    <router-view />
  </div>
</template>
<script>
import { resize } from "@/utils/zoom.js";
export default {
  mounted() {
    //启动时进行一次调整
    document.getElementById("app").style.cssText = "zoom:" + resize();
    //随着大小变动进行调整
    window.onresize = () => {
      document.getElementById("app").style.cssText = "zoom:" + resize();
    };
  }
};
</script>
<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}

html,
body,
#app {
  width: 100%;
  height: 100%;
  margin: 0;
  overflow: hidden;
}
#app {
  position: relative;
}
</style>
