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
