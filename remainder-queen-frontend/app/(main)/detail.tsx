// import { AppButton } from '@/components/ui-kit/AppButton';
// import { Avatar, Layout, Tab, TabView, Text } from '@ui-kitten/components';
// import React from 'react';
// import { StyleSheet, View } from 'react-native';

// export default function DetailScreen() {
//   const [selectedIndex, setSelectedIndex] = React.useState(0);

//   return (
//     <Layout style={styles.container}>
//       {/* <Text category="h6" style={styles.title}>File GST & IT Return</Text> */}
//       <TabView selectedIndex={selectedIndex} onSelect={setSelectedIndex} style={styles.tabView}>
//         <Tab title='Task'>
//           <View style={{ flex: 1 }}>
//             <View style={styles.section}>
//               <Text appearance="hint">Assigned by</Text>
//               <View style={styles.row}>
//                 <Avatar size='small' style={styles.avatar}/>
//                 <Text style={styles.user}>Abhishek Dewangan</Text>
//               </View>
//               <Text style={styles.label}>Subject</Text>
//               <Text category="s1">File GST & IT Return</Text>
//               <Text appearance="hint" style={styles.desc}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Eget diam commodo dui, in tempor.</Text>
//             </View>
//           </View>
//         </Tab>
//         <Tab title='Comments'>
//           <View>
//             <View style={styles.section}>
//               <Text appearance="hint">No comments yet.</Text>
//             </View>
//           </View>
//         </Tab>
//       </TabView>
//       <View style={styles.buttonRowFixed}>
//         <AppButton status="primary" style={styles.actionBtn}>Done</AppButton>
//         <AppButton status="danger" style={styles.actionBtn}>Reject</AppButton>
//         <AppButton status="basic" style={styles.actionBtn}>Revert</AppButton>
//       </View>
//     </Layout>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     paddingHorizontal: 20,
//     paddingTop: 24,
//     paddingBottom: 0,
//     backgroundColor: '#F7F9FC',
//   },
//   title: {
//     marginBottom: 18,
//     fontWeight: 'bold',
//     fontSize: 20,
//   },
//   tabView: {
//     flex: 1,
//   },
//   section: {
//     marginVertical: 18,
//     paddingHorizontal: 2,
//   },
//   row: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   avatar: {
//     marginRight: 10,
//   },
//   user: {
//     fontSize: 15,
//     fontWeight: '500',
//   },
//   label: {
//     marginTop: 10,
//     fontWeight: 'bold',
//     fontSize: 13,
//   },
//   desc: {
//     marginTop: 6,
//     fontSize: 13,
//     color: '#6B7280',
//   },
//   buttonRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 24,
//   },
//   buttonRowFixed: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     position: 'absolute',
//     left: 20,
//     right: 20,
//     bottom: 28,
//     backgroundColor: 'transparent',
//     zIndex: 10,
//     paddingBottom: 0,
//   },
//   actionBtn: {
//     flex: 1,
//     marginHorizontal: 6,
//     height: 44,
//   },
// });
import { AppButton } from "@/components/ui-kit/AppButton";
import { useTasks } from "@/context/TaskContext";
import TaskService from "@/services/task";
import {
  Avatar,
  Layout,
  Spinner,
  Tab,
  TabView,
  Text,
} from "@ui-kitten/components";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

interface TaskDetail {
  id: number;
  Title: string;
  Description: string;
  AssignTo: string;
  Assignee: string;
  Status: string;
}

export default function DetailScreen() {
  const { fetchTasks } = useTasks();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { id } = useLocalSearchParams(); // Expecting ?id=123 or route param

  const handleTaskStatusUpdate = async (status: string) => {
    try {
      setLoading(true);
      setError(null);
      const sendData = { status };
      const data = await TaskService.updateTaskStatus(Number(id), sendData);
      if (data.isSuccess === false) {
        setError(data.message || "Failed to update task status");
      } else {
        fetchTasks();
        router.back();
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Something went wrong. Try again.");
    }
  };

  useEffect(() => {
    const fetchTask = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const data = await TaskService.getTaskById(Number(id));
        if (data.isSuccess === false) {
          setError(data.message || "Failed to fetch task");
          setTask(null);
        } else {
          console.log("Fetched task data:", data.result);

          setTask(data.result);
        }
      } catch (err) {
        console.error("Failed to fetch task:", err);
        setError("Something went wrong while fetching the task.");
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [id]);

  if (loading) {
    return (
      <Layout style={styles.container}>
        <Spinner size="giant" />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout style={styles.container}>
        <Text style={{ color: "red" }}>{error}</Text>
      </Layout>
    );
  }

  if (!task) {
    return (
      <Layout style={styles.container}>
        <Text>No task found.</Text>
      </Layout>
    );
  }

  return (
    <Layout style={styles.container}>
      <TabView
        selectedIndex={selectedIndex}
        onSelect={setSelectedIndex}
        style={styles.tabView}
      >
        <Tab title="Task">
          <View style={{ flex: 1 }}>
            <View style={styles.section}>
              <Text appearance="hint">Assigned by</Text>
              <View style={styles.row}>
                <Avatar size="small" style={styles.avatar} />
                <Text style={styles.user}>{task.Assignee}</Text>
              </View>
              <Text style={styles.label}>Subject</Text>
              <Text category="s1">{task.Title}</Text>
              <Text appearance="hint" style={styles.desc}>
                {task.Description}
              </Text>
            </View>
          </View>
        </Tab>
        <Tab title="Comments">
          <View>
            <View style={styles.section}>
              <Text appearance="hint">No comments yet.</Text>
            </View>
          </View>
        </Tab>
      </TabView>
      <View style={styles.buttonRowFixed}>
        <AppButton
          status="primary"
          style={styles.actionBtn}
          onPress={() => handleTaskStatusUpdate("Completed")}
        >
          Done
        </AppButton>
        <AppButton
          status="danger"
          style={styles.actionBtn}
          onPress={() => handleTaskStatusUpdate("Rejected")}
        >
          Reject
        </AppButton>
        <AppButton
          status="basic"
          style={styles.actionBtn}
          onPress={() => handleTaskStatusUpdate("Reverted")}
        >
          Revert
        </AppButton>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 0,
    backgroundColor: "#F7F9FC",
  },
  tabView: {
    flex: 1,
  },
  section: {
    marginVertical: 18,
    paddingHorizontal: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  avatar: {
    marginRight: 10,
  },
  user: {
    fontSize: 15,
    fontWeight: "500",
  },
  label: {
    marginTop: 10,
    fontWeight: "bold",
    fontSize: 13,
  },
  desc: {
    marginTop: 6,
    fontSize: 13,
    color: "#6B7280",
  },
  buttonRowFixed: {
    flexDirection: "row",
    justifyContent: "space-between",
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 28,
    backgroundColor: "transparent",
    zIndex: 10,
    paddingBottom: 0,
  },
  actionBtn: {
    flex: 1,
    marginHorizontal: 6,
    height: 44,
  },
});
