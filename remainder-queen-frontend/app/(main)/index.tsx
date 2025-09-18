import { AppButton } from "@/components/ui-kit/AppButton";
import { AppIcon } from "@/components/ui-kit/AppIcon";
import { TabSwitcher } from "@/components/ui-kit/TabSwitcher";
import { TaskCard } from "@/components/ui-kit/TaskCard";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/context/AuthContext";
import { useTasks } from "@/context/TaskContext";
import { Input, Layout, Text } from "@ui-kitten/components";
import { sendTestNotification } from "@/services/testNotification";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [search, setSearch] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const { tasks, loading, error, fetchTasks } = useTasks();
  const [notifStatus, setNotifStatus] = useState<string>("");

  const handleTestNotification = async () => {
    setNotifStatus("Sending...");
    try {
      const res = await sendTestNotification();
      if (res && res.isSuccess) {
        setNotifStatus("Test notification sent!");
      } else {
        setNotifStatus(res?.message || "Failed to send notification");
      }
    } catch (e: any) {
      setNotifStatus(e?.message || "Error sending notification");
    }
  };

  // const [tasks, setTasks] = useState<Task[]>([]);
  // const [loading, setLoading] = useState<boolean>(false);
  // const [error, setError] = useState<string | null>(null);

  // const fetchTasks = async () => {
  //   setLoading(true);
  //   setError(null);

  //   try {
  //     const data = await TaskService.getTasks();
  //     if (data.isSuccess === false) {
  //       setError(data.message || "Failed to fetch tasks");
  //       setTasks([]);
  //       return;
  //     } else {
  //       setTasks(data.result || []);
  //     }
  //   } catch (err) {
  //     console.error("Failed to fetch tasks:", err);
  //     setError("Something went wrong while fetching tasks.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  
   useEffect(() => {
     fetchTasks();
  }, []);

  const filteredTasks = tasks.filter((task) => {
    if (!user) return false;

    if (selectedIndex === 0) {
      return task.AssignTo === user.phoneNo && task.Status === "Todo";
    }

    if (selectedIndex === 1) {
      return  task.Status === "Completed";
    }

    if (selectedIndex === 2) {
      return task.Assignee === user.phoneNo && task.Status !== "Completed";
    }

    return true;
  });

  // Get background color based on selected tab
  const getBackgroundColor = () => {
    switch (selectedIndex) {
      case 0:
        return Colors.light.statusBackgrounds.todo;
      case 1:
        return Colors.light.statusBackgrounds.completed;
      case 2:
        return Colors.light.statusBackgrounds.assigned;
      default:
        return Colors.light.statusBackgrounds.todo;
    }
  };

  const handleLogout = () => {
    logout();
    setVisible(false);
    router.replace("/(auth)/login");
  };

  if (loading) {
    return <Text>Loading tasks...</Text>;
  }

  if (error) {
    return <Text style={{ color: "red" }}>{error}</Text>;
  }

  const handleCardPress = (taskId: number) => {
    router.push(`/detail?id=${taskId}`);
  };

  return (
    <Layout style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <View>
            <Text category="h5" style={{ fontWeight: "600" }}>
              Reminder Queen
            </Text>
            <Text appearance="hint" style={styles.subtitle}>
              Powered by Ironin Re-engineering Pvt Ltd
            </Text>
          </View>
          {/* <TouchableOpacity onPress={() => router.push("/detail")}>
            <AppIcon name="more-vertical" pack="eva" style={styles.menuIcon} />
          </TouchableOpacity> */}

          <TouchableOpacity onPress={() => setVisible(true)}>
            <AppIcon name="more-vertical" pack="eva" style={styles.menuIcon} />
          </TouchableOpacity>

          {/* Modal menu */}
          <Modal
            transparent
            animationType="fade"
            visible={visible}
            onRequestClose={() => setVisible(false)}
          >
            <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
              <View style={styles.menuBox}>
                <Pressable style={styles.menuItem} onPress={handleLogout}>
                  <Text style={styles.menuText}>Logout</Text>
                </Pressable>
              </View>
            </Pressable>
          </Modal>
        </View>
        <TabSwitcher
          selectedIndex={selectedIndex}
          onSelect={setSelectedIndex}
        />
      </View>
      <View style={[styles.content, { backgroundColor: getBackgroundColor() }]}> 
        {/* Test Push Notification Button */}
        <AppButton
          style={{ marginBottom: 12 }}
          status="info"
          onPress={handleTestNotification}
        >
          Send Test Push Notification
        </AppButton>
        {!!notifStatus && (
          <Text style={{ marginBottom: 8, color: notifStatus.includes("sent") ? 'green' : 'red' }}>{notifStatus}</Text>
        )}
        <Input
          placeholder="Search"
          value={search}
          onChangeText={setSearch}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          status={
            isFocused
              ? selectedIndex === 0
                ? "info"
                : selectedIndex === 1
                ? "success"
                : "warning"
              : "basic"
          }
          style={styles.search}
          accessoryLeft={<AppIcon name="search" pack="eva" />}
        />
        {/* <ScrollView style={styles.scroll}>
        {filteredTasks.map((task) => {
          let color = Colors.light.statusColors.todo; // Default blue
          if (selectedIndex === 1) {
            color = Colors.light.statusColors.completed; // Green for completed
          } else if (selectedIndex === 2) {
            color = Colors.light.statusColors.assigned; // Orange for assigned
          }
          return <TaskCard key={task.id} {...task} color={color} />;
        })}
      </ScrollView> */}

        <ScrollView style={styles.scroll}>
          {filteredTasks.map((task) => {
            let color = Colors.light.statusColors.todo; // Default
            if (selectedIndex === 1) {
              color = Colors.light.statusColors.completed;
            } else if (selectedIndex === 2) {
              color = Colors.light.statusColors.assigned;
            }

            return (
              <TaskCard
                key={task.id}
                id={task.id}
                title={task.Title} // subject → title
                description={task.Description} // description stays the same
                user={task.AssignTo} // assignTo → user
                time={"Today"} // 🔹 Replace with real timestamp if available
                color={color}
                completed={task.Status === "Completed"} // backend status → completed boolean
                onPress={handleCardPress} // Handle card press
              />
            );
          })}
        </ScrollView>

        <AppButton
          style={[
            styles.fab,
            {
              backgroundColor:
                selectedIndex === 0
                  ? Colors.light.statusColors.todo
                  : selectedIndex === 1
                  ? Colors.light.statusColors.completed
                  : Colors.light.statusColors.assigned,
            },
          ]}
          status={
            selectedIndex === 0
              ? "info"
              : selectedIndex === 1
              ? "success"
              : "warning"
          }
          accessoryLeft={<AppIcon name="plus" pack="eva" color="white" />}
          onPress={() => router.push("/create-todo")}
        >
          {""}
        </AppButton>

        <AppButton
          style={[
            styles.fab,
            {
              bottom: 100,
              backgroundColor: '#2196F3', // Info blue color
            }
          ]}
          status="info"
          accessoryLeft={<AppIcon name="bell" pack="eva" color="white" />}
          onPress={handleTestNotification}
        >
          {""}
        </AppButton>
        {notifStatus ? (
          <Text style={{
            position: 'absolute',
            bottom: 80,
            left: 16,
            right: 16,
            textAlign: 'center',
            color: '#666',
            fontSize: 12,
            backgroundColor: 'rgba(255,255,255,0.9)',
            padding: 4,
            borderRadius: 4,
            elevation: 2
          }}>
            {notifStatus}
          </Text>
        ) : null}
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    backgroundColor: "#FFFFFF",
    paddingTop: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  content: {
    flex: 1,
    padding: 16,
    paddingTop: 8,
  },
  subtitle: {
    fontSize: 12,
    color: "#6C757D",
    marginTop: 4,
  },

  search: {
    marginVertical: 8,
  },
  scroll: {
    flex: 1,
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 24,
    borderRadius: 28,
    width: 56,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  menuIcon: {
    width: 24,
    height: 24,
    tintColor: "#111",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },
  menuBox: {
    backgroundColor: "#fff",
    padding: 15,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  menuItem: {
    paddingVertical: 12,
  },
  menuText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#e63946",
  },
});
