const commonCss = {
  colors: {
    black: '#000000',
    white: '#ffffff',
    grey100: '#F4F7F6',
    grey200: '#e6eaea',
  },
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
  ...commonCss,
  colors: {
    ...commonCss.colors,
    background: '#f4f4f4',
    fontColor: '#221e1f',
  },
};

export const dark = {
  ...commonCss,
  colors: {
    ...commonCss.colors,
    background: '#161415',
    fontColor: '#ffffff',
  },
};
