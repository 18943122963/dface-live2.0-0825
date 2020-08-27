<!-- 处理商品及websocket推送 -->
<template>
  <div class="bg">
    <div class="up_box">
      <div class="up_box_container">
        <img class="up_box_logo" src="../assets/img/logo_lianlian.png" />
        <div class="up_box_title">脸脸</div>
      </div>
    </div>
    <div class="bottom_box" v-show="product_itemId">
      <img :src="product_pic" class="picture" />
      <div class="flag"></div>
      <div class="flag_title">正在直播</div>

      <div class="bottom_box_middle">
        <div class="title">
          <!-- 文字截取组件 -->
          <DfaceFontbox :str="product_title" :config="config1" />
        </div>
        <div class="title_second">
          <!-- 文字截取组件 -->
          <DfaceFontbox :str="product_name" :config="config2" />
        </div>
        <div class="price">
          <div class="price_flag">
            {{ product_price_unit === "元" ? "¥" : "积分" }}
          </div>
          <div class="price_now">{{ product_price_now }}</div>
          <div class="price_now_after">{{ product_price_now_after }}</div>

          <div class="price_old" v-if="product_price_old">
            原价：{{ product_price_old }}
            {{ product_price_unit === "元" ? "元" : "分" }}
          </div>
        </div>
      </div>
      <div class="bottom_box_right">
        <div class="code" ref="qrcode" id="qrcode"></div>
        <div class="code_text">扫码抢购</div>
      </div>
    </div>
  </div>
</template>

<script>
import { fetch } from "dface-fetch";
import QRCode from "qrcode2";
import MyWebSocket from "@/utils/MyWebSocket.js";
import { DfaceFontbox } from "dface-ui";
export default {
  components: { DfaceFontbox },
  data() {
    return {
      product_itemId: undefined,
      product_title: "加载中...",
      product_name: "加载中...",
      product_pic: "",
      product_price_now: 0,
      product_price_now_after: "",
      product_price_old: 0,
      product_price_unit: "元",
      config1: {
        range: [
          ["min", 5, 43],
          [5, 12, 36],
          [12, 14, 26]
        ]
      },
      config2: {
        range: [
          ["min", 11, 24],
          [11, 16, 20],
          [16, 20, 18]
        ]
      }
    };
  },
  methods: {
    //配置websocket
    setWebsocket() {
      let wsconfig = {
        origin: process.env.VUE_APP_URL,
        url: "api/v1/ws/endpoint",
        log: true,
        subscribe: [
          {
            key: "APP84_CHANGE_CURRENT_ITEM",
            handle: data => this.getNews(data)
          }
        ]
      };
      new MyWebSocket(wsconfig);
    },
    // 生成二维码
    qrcodeScan() {
      const origin = process.env.VUE_APP_URL_BLUE;
      document.getElementById("qrcode").innerHTML = "";
      new QRCode(document.getElementById("qrcode"), {
        text: `${origin}detail/${this.product_itemId}?shopId=40293836`, // 二维码地址
        width: 154, // 二维码宽度
        height: 155 // 二维码高度
      });
    },
    // 接收websocket信息，为空时触发
    getNews(data) {
      !data && this.getProduct();
    },
    //接收商品信息并渲染
    getProduct() {
      fetch.get("api/product/current").then(data => {
        if (data && data.object) {
          const product = data.object;
          //获取itemid，渲染二维码
          this.product_itemId = product.itemId;
          console.log(this.product_itemId);
          this.product_title = product.title ? product.title : "默认产品标题";
          this.product_name = product.sellingPoint
            ? product.sellingPoint
            : "默认产品副标题";
          //图片
          this.product_pic = product.imgList
            ? product.imgList[0]
            : "../assets/logo.png";
          //价格
          if (product.skuList[0] && product.skuList[0].skuPrice) {
            //若是价格
            if (product.skuList[0].skuPrice.price) {
              const price = product.skuList[0].skuPrice.price;
              this.product_price_unit = "元";
              //获取的价格是分，除以100并向下舍入
              //小数点后需要特殊处理，截取出来
              this.product_price_now = Math.floor(price / 100);
              //求出小数点后
              let reduce_result = (price - this.product_price_now * 100) / 100;
              //小数点后为0，添加0
              if (reduce_result === 0) {
                this.product_price_now_after = ".00";
              }
              //小数点有数字
              else {
                this.product_price_now_after = "." + reduce_result * 100;
              }
            }
            //若是积分
            else if (product.skuList[0].skuPrice.rewardPoints) {
              this.product_price_unit = "积分";
              this.product_price_now = product.skuList[0].skuPrice.rewardPoints;
            }
            this.product_price_old =
              product.skuList[0].skuPrice.originalPrice / 100 || 0;
          }
          //生成二维码
          this.qrcodeScan();
        }
      });
    }
  },
  mounted() {
    //链接websocket
    // this.setWebsocket();
  }
};
</script>
<style lang="scss" scoped>
@font-face {
  font-family: "AlibabaPuHuiTi-Bold"; //重命名字体名
  src: url("https://qiniu-common.dface.cn/font/ttf/Alibaba-PuHuiTi-Bold.ttf"); //引入字体
}
@font-face {
  font-family: "AlibabaPuHuiTiH"; //重命名字体名
  src: url("https://qiniu-common.dface.cn/font/ttf/Alibaba-PuHuiTi-Heavy.ttf"); //引入字体
}
@font-face {
  font-family: "AlibabaPuHuiTi"; //重命名字体名
  src: url("https://qiniu-common.dface.cn/font/ttf/Alibaba-PuHuiTi-Light.ttf"); //引入字体
}
@font-face {
  font-family: "AlibabaPuHuiTi-Medium"; //重命名字体名
  src: url("https://qiniu-common.dface.cn/font/ttf/Alibaba-PuHuiTi-Medium.ttf"); //引入字体
}
@font-face {
  font-family: "AlibabaPuHuiTiR"; //重命名字体名
  src: url("https://qiniu-common.dface.cn/font/ttf/Alibaba-PuHuiTi-Regular.ttf"); //引入字体
}
@font-face {
  font-family: "Bebas"; //重命名字体名
  src: url("https://qiniu-common.dface.cn/font/ttf/bebas.ttf"); //引入字体
}

.bg {
  width: 960px;
  height: 1080px;
  background: url("../assets/img/bg.png") no-repeat;
  background-size: 100% 100%;
}
.up_box {
  position: absolute;
  width: 100%;
  height: 109px;
  top: 75px;
  left: 73px;
  zoom: 0.8;
  text-align: left;
  .up_box_container {
    position: relative;
    display: inline-flex;
    flex-direction: row;
    align-items: center;
    height: 109px;
    padding: 0 30px 0 12px;
    background: rgba(10, 10, 16, 0.42);
    border-radius: 55px;
  }
  .up_box_logo {
    border-radius: 45px;
    width: 90px;
    height: 90px;
  }
  .up_box_title {
    margin-left: 10px;
    max-width: 500px;
    height: 50px;
    font-size: 30px;
    font-family: AlibabaPuHuiTi-Bold, AlibabaPuHuiTi;
    font-weight: bold;
    color: rgba(255, 255, 255, 1);
    line-height: 50px;
  }
}
.bottom_box {
  background: url("../assets/img/bottom_box.png") no-repeat;
  background-size: 100% 100%;
  position: absolute;
  top: 812px;
  left: 85px;
  width: 794px;
  height: 194px;
  .picture {
    position: absolute;
    background: black;
    top: 18px;
    left: 21px;
    width: 158px;
    height: 158px;
  }
  .flag {
    position: absolute;
    background: url("../assets/img/flag.png");
    top: 25px;
    left: 14px;
    width: 98px;
    height: 49px;
  }
  .flag_title {
    position: absolute;
    top: 29px;
    left: 30px;
    height: 25px;
    font-size: 18px;
    font-family: AlibabaPuHuiTiR;
    color: rgba(255, 255, 255, 1);
    line-height: 25px;
  }
  .bottom_box_middle {
    .title {
      position: absolute;
      top: 14px;
      left: 197px;
      width: 374px;
      height: 59px;
      font-size: 36px;
      font-family: AlibabaPuHuiTiH;
      color: rgba(34, 34, 34, 1);
      line-height: 59px;
      text-align: left;
    }
    .title_second {
      position: absolute;
      top: 71px;
      left: 197px;
      width: 374px;
      height: 33px;
      font-size: 24px;
      font-family: AlibabaPuHuiTiR;
      color: rgba(0, 0, 0, 1);
      line-height: 33px;
      text-align: left;
    }
    .price {
      position: absolute;
      left: 197px;
      top: 94px;
      bottom: 8px;
      .price_now {
        height: 92px;
        font-size: 70px;
        font-family: Bebas;
        color: rgba(238, 48, 48, 1);
        line-height: 92px;
        display: inline-block;
      }
      .price_now_after {
        height: 42px;
        font-size: 30px;
        font-family: AlibabaPuHuiTiR;
        color: rgba(238, 48, 48, 1);
        line-height: 42px;
        display: inline-block;
      }
      .price_flag {
        height: 42px;
        font-size: 30px;
        font-family: AlibabaPuHuiTiR;
        color: rgba(238, 48, 48, 1);
        line-height: 42px;
        display: inline-block;
      }
      .price_old {
        height: 27px;
        font-size: 20px;
        margin-left: 10px;
        font-family: AlibabaPuHuiTiR;
        color: rgba(102, 102, 102, 1);
        line-height: 27px;
        text-decoration: line-through;
        display: inline-block;
      }
    }
  }
  .bottom_box_right {
    position: absolute;
    background: url("../assets/img/code_box.png");
    bottom: 17px;
    right: 17px;
    width: 176px;
    height: 223px;
    .code {
      position: absolute;
      background: black;
      top: 11px;
      left: 11px;
      width: 154px;
      height: 155px;
    }
    .code_text {
      position: absolute;
      top: 171px;
      left: 28px;
      height: 43px;
      font-size: 31px;
      font-family: AlibabaPuHuiTi-Medium, AlibabaPuHuiTi;
      font-weight: 500;
      color: rgba(255, 255, 255, 1);
      line-height: 43px;
    }
  }
}
</style>
