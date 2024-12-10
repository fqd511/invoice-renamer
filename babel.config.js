// babel.config.js
module.exports = {
    presets: [
      '@babel/preset-env',
    ],
    plugins: [
        '@babel/plugin-transform-modules-commonjs' // Add this line
    ],
    sourceType: 'module',
};