// next.config.js
/** @type {import('next').NextConfig} */
const withTM = require('next-transpile-modules')([
  '@mui/x-data-grid'
]);

module.exports = withTM({
  reactStrictMode: true,
  webpack(config) {
    // Permite cargar el CSS que DataGrid importa desde node_modules
    config.module.rules.push({
      test: /\.css$/,
      include: /node_modules\/@mui\/x-data-grid/,
      use: ['style-loader', 'css-loader'],
    });
    return config;
  },
});
