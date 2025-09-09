export default {
  plugins: {
    'postcss-preset-env': {
      features: {
        'css-cascade-layers': true,
        'css-container-queries': true,
        'css-has-pseudo': true,
        'css-logical-properties': true,
        'css-nesting': true,
        'css-scroll-driven-animations': true,
        'css-view-transitions': true,
        'custom-properties': true,
        'focus-visible-pseudo-class': true,
        'has-pseudo-class': true,
        'is-pseudo-class': true,
        'where-pseudo-class': true,
      },
    },
    tailwindcss: {},
    autoprefixer: {},
  },
};