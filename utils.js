function isMobile() {
  const userAgent =
    navigator.userAgent ||
    navigator.vendor ||
    window.opera;

  const isMobileAgent =
    /android|avantgo|blackberry|bb|meego|palm|phone|ipad|ipod|iphone|opera mini|iemobile|mobile|tablet|kindle|silk|hp-tablet|playbook|webos|bb10|nokia|fennec|windows phone|opera mobi|symbian|series60|sonyericsson|netfront|bada|tizen|zte|lumia/i.test(
      userAgent.toLowerCase()
    );

  return isMobileAgent;
}

function evaluateDrawing() {
  // 조건 1. 아래로 돌아오는 진행방향이 존재해서는 안된다.
  const isAnyPlaneGoingDown = _.flatten(
    paperplanes
  ).some((paperplane) => paperplane.isGoingDown);

  if (isAnyPlaneGoingDown) {
    return {
      isValid: false,
      message: "There is a plane going down",
    };
  }

  return {
    isValid: true,
  };
}

function resetPaperplanes() {
  _.flatten(this.planes).forEach((plane) =>
    plane.reset()
  );
}
