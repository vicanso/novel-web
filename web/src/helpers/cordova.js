import EventEmitter from "events";

import { target } from "@/config";

export const Connection = {
  wifi: "wifi"
};

const backbuttonEvent = "backbutton";
const statusTapEvent = "statusTap";

class Cordova extends EventEmitter {
  constructor() {
    super();
    const data = {
      isReady: false
    };
    this.data = data;
    this.once("deviceready", () => {
      data.isReady = true;
    });
    if (target === "web") {
      // 如果是开发环境，模拟ready事件
      setTimeout(() => {
        this.emit("deviceready");
      }, Math.random(500));
    }
  }
  /**
   * 等待cordova可用
   *
   * @returns Promise
   * @memberof Cordova
   */
  waitForReady() {
    if (this.data.isReady) {
      return Promise.resolve();
    }
    return new Promise(resolve => this.once("deviceready", resolve));
  }
  getDevice() {
    if (target === "web") {
      return {
        platform: "android",
        version: "11.0.1",
        uuid: "3B78A311-8A7F-4653-B85E-59B109877625",
        cordova: "4.5.2",
        serial: "unknown"
      };
    }
    return window.device;
  }
  statusBarCall(fn, ...args) {
    if (!window.StatusBar) {
      return;
    }
    window.StatusBar[fn](...args);
  }
  setStatusBarDefault() {
    const statusBar = window.StatusBar;
    if (!statusBar) {
      return;
    }
    statusBar.overlaysWebView(false);
    statusBar.styleBlackTranslucent();
    statusBar.backgroundColorByHexString("#111");
  }
  getConnectionType() {
    if (window.navigator.connection) {
      return window.navigator.connection.type || Connection.wifi;
    }
    return Connection.wifi;
  }
  isWifi() {
    return this.getConnectionType() === Connection.wifi;
  }
  isIOS() {
    return this.getDevice().platform.toLowerCase() === "ios";
  }
  onEvent(type, fn) {
    this.on(type, fn);
    return () => {
      this.removeListener(type, fn);
    };
  }
  onBackButton(fn) {
    return this.onEvent(backbuttonEvent, fn);
  }
  onStatusTap(fn) {
    return this.onEvent(statusTapEvent, fn);
  }
}

const cordova = new Cordova();

[
  "deviceready",
  "pause",
  "resume",
  backbuttonEvent,
  "menubutton",
  "searchbutton",
  "startcallbutton",
  "endcallbutton",
  "volumedownbutton",
  "volumeupbutton",
  "activated",
  statusTapEvent
].forEach(name => {
  if (name === statusTapEvent) {
    window.addEventListener(name, () => {
      cordova.emit(name);
    });
    return;
  }
  document.addEventListener(
    name,
    () => {
      cordova.emit(name);
    },
    false
  );
});

export default cordova;
