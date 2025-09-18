
// This is a shim for web and Android where the tab bar is generally opaque.
import React from "react";
const TabBarBackground = () => null;
export default TabBarBackground;

export function useBottomTabOverflow() {
  return 0;
}
