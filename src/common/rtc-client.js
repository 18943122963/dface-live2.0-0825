import TRTC from "trtc-js-sdk";
import * as common from "./common";
//引入message
import { Message as message, MessageBox } from "element-ui";
import "element-ui/lib/theme-chalk/index.css";

// 设定日志等级为debug
TRTC.Logger.setLogLevel(TRTC.Logger.LogLevel.WARN);
// 默认打开日志上传
TRTC.Logger.enableUploadLog();

let isClick = false;
class RtcClient {
  init(options) {
    this.sdkAppId_ = options.sdkAppId;
    this.userId_ = options.userId;
    this.userSig_ = options.userSig;
    this.roomId_ = options.roomId;

    this.isJoined_ = false;
    this.isPublished_ = false;
    this.isAudioMuted = false;
    this.isVideoMuted = false;
    this.localStream_ = null;
    this.remoteStreams_ = [];
    this.members_ = new Map();

    // 创建客户端实例
    this.client_ = TRTC.createClient({
      mode: "rtc",
      sdkAppId: this.sdkAppId_,
      userId: this.userId_,
      userSig: this.userSig_
    });
    this.handleEvents();
  }

  //加入一个音视频通话房间
  async join(mainVideoId) {
    if (this.isJoined_) {
      console.warn("已经加入了房间，失败");
      return;
    }
    try {
      // 加入房间
      await this.client_.join({ roomId: this.roomId_ });
      console.log("加入房间成功");
      this.isJoined_ = true;

      // 加个延时，等待远程流进入
      setTimeout(() => {
        // 判断该房间是否有人
        if (this.members_.size === 0) {
          message.error("主播似乎尚未开播");
        }
      }, 1000);
      // 这部分是推送本地

      // 若有麦克风和摄像头;
      if (common.getCameraId() && common.getMicrophoneId()) {
        this.localStream_ = TRTC.createStream({
          audio: true,
          video: true,
          userId: this.userId_,
          cameraId: common.getCameraId(),
          microphoneId: common.getMicrophoneId(),
          mirror: true
        });
      } else {
        // 没有就不指定
        this.localStream_ = TRTC.createStream({
          audio: true,
          video: true,
          userId: this.userId_,
          mirror: true
        });
      }
      try {
        // 初始化本地音视频流
        await this.localStream_.initialize();
        console.log("初始化本地音频流成功");
        //监听事件
        this.localStream_.on("player-state-changed", event => {
          console.log(`local stream ${event.type} player is ${event.state}`);
        });
        // 进行发布视频流
        await this.publish();
        message.success("本地音视频流推送成功");
        //打印直播间id
        console.log(mainVideoId, this.localStream_);

        //jq
        // this.localStream_.play("main-video");
        // $("#main-video-btns").show();
        // $("#mask_main").appendTo($("#player_" + this.localStream_.getId()));
      } catch (e) {
        console.error("本地流加载失败 " + e);
      }
    } catch (e) {
      console.error("初始化视频流失败 " + e);
    }
    //jq
    //更新成员状态
    // let states = this.client_.getRemoteMutedState();
    // for (let state of states) {
    //   if (state.audioMuted) {
    //     $("#" + state.userId)
    //       .find(".member-audio-btn")
    //       .attr("src", "./img/mic-off.png");
    //   }
    //   if (state.videoMuted) {
    //     $("#" + state.userId)
    //       .find(".member-video-btn")
    //       .attr("src", "./img/camera-off.png");
    //     $("#mask_" + this.members_.get(state.userId).getId()).show();
    //   }
    // }
  }

  //离开房间
  async leave() {
    if (!this.isJoined_) {
      console.warn("请先加入一个直播间");
      return;
    }
    // 取消发布本地流
    await this.unpublish();

    // 退出房间
    await this.client_.leave();

    this.localStream_.stop();
    this.localStream_.close();
    this.localStream_ = null;
    this.isJoined_ = false;
    resetView();
  }

  //发布视频流
  async publish() {
    if (!this.isJoined_) {
      console.warn("请先加入房间");
      return;
    }
    if (this.isPublished_) {
      console.warn("已经发布了，失败");
      return;
    }
    try {
      await this.client_.publish(this.localStream_);
    } catch (e) {
      message.error("发布音视频流失败 " + e);
      this.isPublished_ = false;
    }

    this.isPublished_ = true;
  }

  //取消发布本地流
  async unpublish() {
    if (!this.isJoined_) {
      console.warn("请先加入一个直播间");
      return;
    }
    if (!this.isPublished_) {
      console.warn("已经取消发布了，错误");
      return;
    }

    await this.client_.unpublish(this.localStream_);
    this.isPublished_ = false;
  }

  //禁用/启用音频轨道
  muteLocalAudio() {
    this.localStream_.muteAudio();
  }

  unmuteLocalAudio() {
    this.localStream_.unmuteAudio();
  }

  //禁用/启用视频轨道
  muteLocalVideo() {
    this.localStream_.muteVideo();
  }

  unmuteLocalVideo() {
    this.localStream_.unmuteVideo();
  }

  //播放视频
  resumeStreams() {
    this.localStream_.resume();
    for (let stream of this.remoteStreams_) {
      stream.resume();
    }
  }

  //事件监听
  handleEvents() {
    // 错误监听
    this.client_.on("error", err => {
      console.error(err);
      alert(err);
      location.reload();
    });
    // 被踢出
    this.client_.on("client-banned", err => {
      console.error("用户被禁止" + err);
      // if (!isHidden()) {
      //   alert("您已被踢出房间");
      //   location.reload();
      // } else {
      //   document.addEventListener(
      //     "visibilitychange",
      //     () => {
      //       if (!isHidden()) {
      //         alert("您已被踢出房间");
      //         location.reload();
      //       }
      //     },
      //     false
      //   );
      // }
    });
    // 当有人加入时
    this.client_.on("peer-join", evt => {
      const userId = evt.userId;
      console.log("有人加入进来了，id" + userId);
      // if (userId !== shareUserId) {
      //   common.addMemberView(userId);
      // }
    });
    // 当有人离开时
    this.client_.on("peer-leave", evt => {
      const userId = evt.userId;
      common.removeView(userId);
      console.log("有人退出了，id" + userId);
    });
    // 有新视频流加入时
    this.client_.on("stream-added", evt => {
      const remoteStream = evt.stream;
      const id = remoteStream.getId();
      const userId = remoteStream.getUserId();
      this.members_.set(userId, remoteStream);
      console.log(
        `增加了新视频流: [${userId}] ID: ${id} type: ${remoteStream.getType()}`
      );
      // if (remoteStream.getUserId() === shareUserId) {
      //   // 不需要看到自己的视频
      //   this.client_.unsubscribe(remoteStream);
      // } else {
      //   console.log("订阅该音视频流");
      //   this.client_.subscribe(remoteStream);
      // }
      console.log("订阅该音视频流");
      this.client_.subscribe(remoteStream);
    });
    // 订阅视频流
    this.client_.on("stream-subscribed", evt => {
      console.log("正在进行订阅");
      const uid = evt.userId;
      const remoteStream = evt.stream;
      const id = remoteStream.getId();
      this.remoteStreams_.push(remoteStream);
      // jq
      remoteStream.on("player-state-changed", event => {
        console.log(`${event.type} 用户状态 ${event.state}`);
        // if (event.type == "video" && event.state == "STOPPED") {
        //   $("#mask_" + remoteStream.getId()).show();
        //   $("#" + remoteStream.getUserId())
        //     .find(".member-video-btn")
        //     .attr("src", "img/camera-off.png");
        // }
        // if (event.type == "video" && event.state == "PLAYING") {
        //   $("#mask_" + remoteStream.getId()).hide();
        //   $("#" + remoteStream.getUserId())
        //     .find(".member-video-btn")
        //     .attr("src", "img/camera-on.png");
        // }
      });
      common.addVideoView(id);
      // 播放远端视频 objectfit :contain/cover
      remoteStream.play("mse", { objectFit: "cover" }).catch(e => {
        // PLAY_NOT_ALLOWED,引导用户手势操作恢复音视频播放，只需要执行一次
        if (e.getCode() === 0x4043 && isClick === false) {
          MessageBox.alert("是否载入直播音频", "提示", {
            confirmButtonText: "确定",
            type: "info"
          })
            .then(() => {
              remoteStream.resume();
            })
            .catch(() => {
              message.error("您取消了授权，可能无法收听音频");
            });
        }
        isClick = true; // 仅出现一次弹窗
      });
      //添加“摄像头未打开”遮罩
      //jq
      // let mask = $("#mask_main").clone();
      // mask.attr("id", "mask_" + id);
      // mask.appendTo($("#player_" + id));
      // mask.hide();
      // if (!remoteStream.hasVideo()) {
      //   mask.show();
      //   $("#" + remoteStream.getUserId())
      //     .find(".member-video-btn")
      //     .attr("src", "img/camera-off.png");
      // }
      console.log("订阅ID为: ", id);
    });
    // 远程流断开
    this.client_.on("stream-removed", evt => {
      const remoteStream = evt.stream;
      const id = remoteStream.getId();
      remoteStream.stop();
      this.remoteStreams_ = this.remoteStreams_.filter(stream => {
        return stream.getId() !== id;
      });
      common.removeView(id);
      console.log(`视频流移除 ID: ${id}  type: ${remoteStream.getType()}`);
    });
    // 远程流更新
    this.client_.on("stream-updated", evt => {
      const remoteStream = evt.stream;
      let uid = this.getUidByStreamId(remoteStream.getId());
      //jq
      // if (!remoteStream.hasVideo()) {
      //   $("#" + uid)
      //     .find(".member-video-btn")
      //     .attr("src", "img/camera-off.png");
      // }
      console.log(
        "type: " +
          remoteStream.getType() +
          "视频流更新了 hasAudio: " +
          remoteStream.hasAudio() +
          " hasVideo: " +
          remoteStream.hasVideo() +
          " uid: " +
          uid
      );
    });
    // 静音
    this.client_.on("mute-audio", evt => {
      console.log(evt.userId + " 静音操作");
      //jq
      // $("#" + evt.userId)
      //   .find(".member-audio-btn")
      //   .attr("src", "img/mic-off.png");
    });
    this.client_.on("unmute-audio", evt => {
      console.log(evt.userId + " 取消静音操作");
      //jq
      // $("#" + evt.userId)
      //   .find(".member-audio-btn")
      //   .attr("src", "img/mic-on.png");
    });
    // 关摄像头
    this.client_.on("mute-video", evt => {
      console.log(evt.userId + " 关闭摄像头");
      // jq
      // $("#" + evt.userId)
      //   .find(".member-video-btn")
      //   .attr("src", "img/camera-off.png");
      // let streamId = this.members_.get(evt.userId).getId();
      // if (streamId) {
      //   $("#mask_" + streamId).show();
      // }
    });
    this.client_.on("unmute-video", evt => {
      console.log(evt.userId + " 取消关闭摄像头");
      // jq
      // $("#" + evt.userId)
      //   .find(".member-video-btn")
      //   .attr("src", "img/camera-on.png");
      // const stream = this.members_.get(evt.userId);
      // if (stream) {
      //   let streamId = stream.getId();
      //   if (streamId) {
      //     $("#mask_" + streamId).hide();
      //   }
      // }
    });
  }

  showStreamState(stream) {
    console.log(
      "音频流: " + stream.hasAudio() + " 视频流: " + stream.hasVideo()
    );
  }

  getUidByStreamId(streamId) {
    for (let [uid, stream] of this.members_) {
      if (stream.getId() == streamId) {
        return uid;
      }
    }
  }
}

export default RtcClient;
