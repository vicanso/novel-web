const config = require("config");

const dev = "development";
const production = "production";
const env = process.env.NODE_ENV || dev;

exports.getENV = () => env;

exports.isDevelopment = () => env === dev;

exports.isProduction = () => env === production;

exports.getConfig = key => config.get(key);
