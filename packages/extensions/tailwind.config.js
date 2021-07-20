module.exports = {
  mode: 'jit',
  purge: ['./public/*.html', './src/**/*.ts', './src/**/*.tsx'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    colors: {
      primary: '#f85f73',
      secondary: '#f7d0a4',
    },
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
