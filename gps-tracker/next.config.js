module.exports = {
  webpack: (config) => {
    config.resolve.alias['mapbox-gl'] = 'mapbox-gl/dist/mapbox-gl.js';
    return config;
  },
};
