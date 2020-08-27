<template>
  <div class="out">
    <!-- 主视频区域 -->
    <div id="mse"></div>
    <!-- 监听区域，暂时不写 -->
    <!-- <div id="self"></div> -->
  </div>
</template>

<script>
import { fetch } from "dface-fetch";
import RtcClient from "../common/rtc-client";
import preset from "../common/presetting";
const rtc = new RtcClient();
export default {
  mounted() {
    //链接直播
    // 拿到两位随机数+当前时间戳当用户名
    let random = Math.round(Math.random() * 100);
    let now = new Date().getTime();

    let userId = random + "_" + now; //用户名
    let roomId = "21835801"; //房间号
    preset.login(userId, roomId, option => {
      rtc.init(option);
      rtc.join("self");
    });
  }
};
</script>
<style lang="scss" scoped>
.out {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  background: blueviolet;
}
.news {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin-bottom: 50px;
  z-index: 124;
}
#mse {
  background: #0b0e71;
  width: 100%;
  padding: 55px;
  text-align: justify !important;
}
#self {
  position: absolute;
  width: 100px;
  height: 200px;
  text-align: justify !important;
}
</style>
<style>
/* #mse > div {
  display: flex;
  justify-content: center;
  align-items: center;
  background: blueviolet !important;
}
#mse > div > video {
  width: auto !important;
} */
</style>
