import React from 'react';
import { Platform } from 'react-native';

// For native, use UI Kitten Eva Icons
// For web, use @expo/vector-icons (MaterialCommunityIcons as example)

let EvaIcon: any = null;
let ExpoIcon: any = null;

if (Platform.OS !== 'web') {
  EvaIcon = require('@ui-kitten/components').Icon;
} else {
  ExpoIcon = require('@expo/vector-icons').MaterialCommunityIcons;
}

export const AppIcon = (props: any) => {
  if (Platform.OS !== 'web') {
    // UI Kitten Icon expects 'name' and 'pack'
    return <EvaIcon {...props} />;
  } else {
    // Map Eva icon names to MaterialCommunityIcons as needed
    // Fallback to 'help-circle' if not mapped
    const evaToMCI: Record<string, string> = {
      'search': 'magnify',
      'plus': 'plus',
      'more-vertical': 'dots-vertical',
      // Add more mappings as needed
    };
    const name = evaToMCI[props.name] || 'help-circle';
    return <ExpoIcon name={name} size={props.style?.width || 24} color={props.style?.tintColor || '#222'} />;
  }
};
