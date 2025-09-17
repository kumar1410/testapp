import { Colors } from '@/constants/Colors';
import { Tab, TabBar, Text } from '@ui-kitten/components';
import React from 'react';
import { StyleSheet } from 'react-native';

export interface TabSwitcherProps {
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export const TabSwitcher: React.FC<TabSwitcherProps> = ({ selectedIndex, onSelect }) => (
  
  <TabBar
    selectedIndex={selectedIndex}
    onSelect={onSelect}
    style={styles.tabBar}
    indicatorStyle={{
      backgroundColor: selectedIndex === 0 
        ? Colors.light.statusColors.todo 
        : selectedIndex === 1 
          ? Colors.light.statusColors.completed 
          : Colors.light.statusColors.assigned
    }}
  >
    <Tab 
      title={() => (
        <Text style={{
          color: selectedIndex === 0 ? Colors.light.statusColors.todo : '#8F9BB3',
          fontFamily: 'Poppins-Medium'
        }}>
          Todo
        </Text>
      )}
    />
    <Tab 
      title={() => (
        <Text style={{
          color: selectedIndex === 1 ? Colors.light.statusColors.completed : '#8F9BB3',
          fontFamily: 'Poppins-Medium'
        }}>
          Completed
        </Text>
      )}
    />
    <Tab 
      title={() => (
        <Text style={{
          color: selectedIndex === 2 ? Colors.light.statusColors.assigned : '#8F9BB3',
          fontFamily: 'Poppins-Medium'
        }}>
          Assign to
        </Text>
      )}
    />
  </TabBar>
//   <TabBar
//   selectedIndex={selectedIndex}
//   onSelect={onSelect}
//   style={styles.tabBar}
//   indicatorStyle={{
//     backgroundColor: selectedIndex === 0 
//       ? Colors.light.statusColors.todo 
//       : selectedIndex === 1 
//         ? Colors.light.statusColors.completed 
//         : Colors.light.statusColors.assigned
//   }}
// >
//   <Tab 
//     title={() => (
//       <Text 
//         category="s1" 
//         style={[
//           styles.tabTitle,
//           { 
//             color: getTabColor(0,selectedIndex), 
//             fontFamily: 'Poppins-Regular'
//           }
//         ]}
//       >
//         Todo
//       </Text>
//     )}
//   />
//   <Tab 
//     title={() => (
//       <Text 
//         category="s1" 
//         style={[
//           styles.tabTitle,
//           { 
//             color: getTabColor(1,selectedIndex), 
//             fontFamily: 'Poppins-Regular'
//           }
//         ]}
//       >
//         Completed
//       </Text>
//     )}
//   />
//   <Tab 
//     title={() => (
//       <Text 
//         category="s1" 
//         style={[
//           styles.tabTitle,
//           { 
//             color: getTabColor(2,selectedIndex), 
//             fontFamily: 'Poppins-Regular'
//           }
//         ]}
//       >
//         Assign to
//       </Text>
//     )}
//   />
// </TabBar>
);

const getTabColor = (index: number,selectedIndex:number) => {
  switch (index) {
    case 0:
      return selectedIndex === 0 ? Colors.light.statusColors.todo : '#8F9BB3';
    case 1:
      return selectedIndex === 1 ? Colors.light.statusColors.completed : '#8F9BB3';
    case 2:
      return selectedIndex === 2 ? Colors.light.statusColors.assigned : '#8F9BB3';
    default:
      return '#8F9BB3';
  }
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 0,
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginBottom: 2,
  },
  tabTitle: {
    textAlign: 'center',
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
});
