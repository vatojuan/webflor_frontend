// next.config.js
const withTM = require('next-transpile-modules')([
  '@mui/x-data-grid',
]);

module.exports = withTM({
  reactStrictMode: true,
  webpack(config) {
    // Permitimos procesar los CSS que DataGrid importa internamente
    config.module.rules.push({
      test: /\.css$/,
      include: /node_modules\/@mui\/x-data-grid/,
      use: ['style-loader', 'css-loader'],
    });
    return config;
  },
});
