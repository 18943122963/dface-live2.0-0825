import genTestUserSig from './debug/gen-test-user-sig'

// preset before starting RTC
class Presetting {
  init() {
    setBtnClickFuc();
  }

  query(name) {
    const match = window.location.search.match(new RegExp('(\\?|&)' + name + '=([^&]*)(&|$)'));
    return !match ? '' : decodeURIComponent(match[2]);
  }

  login(userId, roomId, callback) {
    const config = genTestUserSig(userId);
    const sdkAppId = config.sdkAppId;
    const userSig = config.userSig;

    callback({
      sdkAppId,
      userId,
      userSig,
      roomId
    });
  }
}
let preset = new Presetting()
export default preset