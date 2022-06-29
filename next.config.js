const withPlugins = require("next-compose-plugins");
const withSvgr = require("next-svgr");

const nextConfig = {
  webpack: function (config) {
    config.externals = config.externals || {}
    config.externals['styletron-server'] = 'styletron-server'
    return config
  }
};

module.exports = withPlugins([
  withSvgr,
], nextConfig);