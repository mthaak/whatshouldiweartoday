const tintColorLight = '#2f95dc';
const tintColorDark = '#fff';

// https://coolors.co/e63946-f1faee-a8dadc-457b9d-1d3557
export const background = '#457b9d';
export const foreground = '#f1faee';
export const darkAccent = '#1d3557';
export const lightAccent = '#f1faee';
export const warningAccent = '#e63946';


export default {
  light: {
    text: '#000',
    background: '#fff',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: foreground,
    background: background,
    tint: darkAccent,
    darkAccent: darkAccent,
    lightAccent: lightAccent,
    warningAccent: warningAccent,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
  },
};
