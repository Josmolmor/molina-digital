const commonCss = {
  weights: {
    bold: 700,
    semiBold: 600,
    medium: 500,
    regular: 400,
    light: 300,
    thin: 100,
  },
};

export const light = {
  colors: {
    accent: '#f5bd14',
    background: '#6c54e9',
    black: '#000000',
    buccaneer: '#6b322e',
    error: '#ef6055',
    goldenrod: '#f9d66a',
    grayscale900: '#0d0a1f',
    grey50: '#f9f9fA',
    primaryLight: '#b1a1ff',
    white40: '#ffffff66',
    white: '#ffffff',
  },
  ...commonCss,
};

export const dark = {
  colors: {
    accent: '#f5bd14',
    background: '#6c54e9',
    black: '#ffffff',
    buccaneer: '#6b322e',
    error: '#ef6055',
    goldenrod: '#f9d66a',
    grayscale900: '#0d0a1f',
    grey50: '#c9d3d0',
    primaryLight: '#b1a1ff',
    white40: '#ffffff66',
    white: '#000000',
  },
  ...commonCss,
};
