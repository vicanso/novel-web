class Logger {
  log(c, args) {
    args.unshift(new Date().toLocaleString());
    window.console[c](...args);
  }
  info(...args) {
    this.log("info", args);
  }
  error(...args) {
    this.log("error", args);
  }
  warn(...args) {
    this.log("warn", args);
  }
}

export default new Logger();
