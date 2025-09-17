import { AppButton } from "@/components/ui-kit/AppButton";
import { Colors } from "@/constants/Colors";
import { useTasks } from "@/context/TaskContext";
import TaskService from "@/services/task";
import { Input, Layout, Text } from "@ui-kitten/components";
import { router } from "expo-router";
import React, { useState } from "react";
import { StyleSheet } from "react-native";

export default function CreateTodoScreen() {
  const { fetchTasks } = useTasks();
  const [assignTo, setAssignTo] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");

  const handleCreateTask = async () => {
    if (!subject.trim() || !description.trim() || !assignTo.trim()) {
      return;
    }

    try {
      await TaskService.createTask({
        assignTo: assignTo.trim(),
        title: subject.trim(),
        description: description.trim(),
      });

      // ✅ Show success message
      alert("Task has been created successfully!");
      fetchTasks();
      // ✅ Navigate back
      router.back();
    } catch (error) {
      console.error("Failed to create task:", error);
      alert("Something went wrong while creating the task. Please try again.");
    }
  };

  return (
    <Layout style={styles.container}>
      <Layout style={styles.content}>
        <Layout style={styles.formContainer}>
          <Input
            label={(evaProps: Record<string, unknown>) => (
              <Text {...evaProps} style={styles.label}>
                Assign To
              </Text>
            )} // @ts-ignore
            placeholder="Assign Person"
            value={assignTo}
            onChangeText={setAssignTo}
            style={styles.input}
            size="large"
          />
          <Input
            label={(evaProps: Record<string, unknown>) => (
              <Text {...evaProps} style={styles.label}>
                Subject
              </Text>
            )} // @ts-ignore
            placeholder="Enter subject"
            value={subject}
            onChangeText={setSubject}
            style={styles.input}
            size="large"
          />
          <Input
            label={(evaProps: Record<string, unknown>) => (
              <Text {...evaProps} style={styles.label}>
                Description
              </Text>
            )} // @ts-ignore
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
            style={styles.input}
            multiline
            textStyle={{
              minHeight: 120,
              textAlignVertical: "top",
              paddingTop: 12,
            }}
            size="large"
          />
        </Layout>
        <Layout style={styles.footer}>
          <AppButton
            style={styles.button}
            status="primary"
            onPress={handleCreateTask}
            size="large"
          >
            Create
          </AppButton>
        </Layout>
      </Layout>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    backgroundColor: Colors.light.contentBackground,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E4E7EB",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.light.text,
  },
  content: {
    flex: 1,
    backgroundColor: Colors.light.background,
    justifyContent: "space-between",
  },
  formContainer: {
    flex: 1,
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.light.text,
    marginBottom: 6,
  },
  input: {
    marginBottom: 20,
    backgroundColor: Colors.light.contentBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E4E7EB",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  footer: {
    padding: 16,
    backgroundColor: Colors.light.contentBackground,
    borderTopWidth: 1,
    borderTopColor: "#E4E7EB",
  },
  button: {
    borderRadius: 8,
    backgroundColor: Colors.light.statusColors.todo,
  },
});
