/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#F8FAFD',
    contentBackground: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    statusColors: {
      todo: '#2E90FA',      // Blue
      completed: '#12B76A',  // Green
      assigned: '#F79009',   // Orange
    },
    statusBackgrounds: {
      todo: '#EEF5FF',      // Light Blue
      completed: '#ECFDF3',  // Light Green
      assigned: '#FFF4ED',   // Light Orange
    },
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};
