import SockJS from "sockjs-client";
import Stomp from "stompjs";

// origin?: string; // 长链接域名
// url?: string; // 长链接地址
// header?: any; // 长链接请求头
// retryTime?: number; // 重试间隔
// onclose?: any; // 关闭回调
// onsuccess?: any; // 成功回调
// onconnect?: any; // 成功回调
// onerror?: any; // 错误回调
// subscribe?: ISubscribe[]; // 订阅列表
// log?: boolean; // 是否需要日志
class MyWebSocket {
  constructor({
    origin,
    url,
    header,
    onclose,
    onsuccess,
    onerror,
    onconnect,
    retryTime,
    subscribe,
    log
  }) {
    // 初始化ws域
    this.wsOrigin = origin || window.origin;
    // 初始化ws链接地址
    this.wsUrl =
      url ||
      `${this.wsOrigin}/api/v1/ws/endpoint?token=` + new Date().getTime();
    this.wsHeader = header || {};
    this.retryTime = retryTime || 10 * 1000;
    this.subscribe = subscribe;
    this.log = log || false;
    if (onsuccess) {
      this.onsuccess = onsuccess;
    }
    if (onconnect) {
      this.connectCallback = onconnect;
    }
    if (onerror) {
      this.errorCallBack = onerror;
    }
    this.connection();
    // 关闭处理
    this.stompClient.ws.onclose = onclose || this.oncloseWs;
  }
  consoleSuc(str) {
    if (!this.log) {
      return;
    }
    console.log(`%cDfaceWs:${str}`, "color:#89BEB2");
  }
  consoleErr(str) {
    if (!this.log) {
      return;
    }
    console.log(`%cDfaceWs:${str}`, "color:#FE4365");
  }
  consoleWarn(str) {
    if (!this.log) {
      return;
    }
    console.log(`%cDfaceWs:${str}`, "color:#F9CDAD");
  }
  // 建立连接
  connection() {
    this.subscriptionList = [];
    this.consoleWarn(`长链接地址:${this.wsUrl}`);
    // 建立连接对象
    this.socket = new SockJS(this.wsUrl);
    // 获取STOMP子协议的客户端对象
    this.stompClient = Stomp.over(this.socket);
    if (!this.log) {
      this.stompClient.debug = null;
    }
    // 建立连接
    this.stompClient.connect(
      this.wsHeader,
      this.connectCallback,
      this.errorCallBack
    );
  }
  // ws连接 成功回调
  connectCallback = () => {
    this.consoleSuc("----- Ws连接成功 -----");
    this.clearRetryTimer(); // 清除重试定时器
    this.initSubscribe();
    if (this.onsuccess) {
      this.onsuccess(this);
    }
  };
  // ws连接 失败回调
  errorCallBack = error => {
    this.consoleErr("----- Ws连接出错 -----");
    console.error(error);
    this.clientRetry();
  };
  // ws关闭 - 发起重试
  oncloseWs = closeEvnet => {
    this.consoleErr("websocket close code is " + closeEvnet.code);
    this.clientRetry();
  };
  // 客户端重试
  clientRetry() {
    this.clearRetryTimer();
    this.retryTimer = setTimeout(() => {
      this.consoleWarn("-----Ws正在发起重试-----");
      this.connection();
    }, this.retryTime);
  }
  clearRetryTimer() {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
    }
  }
  // 断开连接
  disconnect() {
    if (this.stompClient) {
      this.stompClient.disconnect();
    }
  }
  // 初始化订阅
  initSubscribe() {
    if (this.subscribe && this.subscribe.length) {
      this.subscribe.forEach(sub => {
        let subscription = this.sub(sub);
        this.subscriptionList.push(subscription);
      });
    }
  }
  /**
   * 订阅
   * @method sub
   * @param (object) sub
   * @param (string) sub.key 订阅的key值
   * @param (function) sub.handle (message)=>{} 接受消息后的处理函数
   * @return subscription stompClient返回的订阅
   */
  sub(sub) {
    let subscription = this.stompClient.subscribe(
      `/queue/${sub.key}/message`,
      greeting => {
        // let message = JSON.parse(greeting?.body );
        sub.handle(greeting && greeting.body);
      }
    );
    subscription.key = sub.key;
    subscription.id = sub.id || subscription.id;
    return subscription;
  }
  /**
   * 取消订阅
   * @method unSubByKey
   * @param (string) key 订阅的key值
   */
  unSubByKey(key) {
    let subscription = this.subscriptionList.find(
      subscription => subscription.key === key
    );
    subscription.unsubscribe();
  }
}
export default MyWebSocket;
