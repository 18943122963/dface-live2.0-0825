<template>
  <div class="home">
    <Live />
    <News class="news" ref="news"></News>
  </div>
</template>
·
<script>
// @ is an alias to /src
import Live from "@/components/Live.vue";
import News from "@/components/News";

export default {
  name: "Home",
  components: {
    Live,
    News
  }
};
</script>
<style lang="scss">
.home {
  position: relative;
  height: 100%;
  width: 100%;

  background: url("../assets/img/bg.png") no-repeat;
  background-size: 100% 100%;
}
.news {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
}
</style>