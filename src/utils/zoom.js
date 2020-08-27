export const resize = () => {
  let windowH = window.innerHeight;
  let windowW = window.innerWidth;
  let scale = 1;
  let radio = windowW / windowH;
  //横屏时
  if (windowW > windowH) {
    //仅适配为16:9
    if (radio > 16 / 9) {
      scale = windowW / 1920;
    } else {
      scale = windowH / 1080;
    }
  }
  //竖屏时
  else {
    //3:4
    if (radio > (8 / 9 + 9 / 16) / 2) {
      if (radio > 16 / 18) {
        scale = windowW / 960;
      } else {
        scale = windowH / 1080;
      }
    }
    //9:16
    else {
      if (radio > 9 / 16) {
        scale = windowH / 1920;
      } else {
        scale = windowW / 1080;
      }
    }
  }
  return scale;
};
