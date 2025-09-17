import TaskService from "@/services/task"; // adjust import
import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext, useEffect, useState } from "react";

interface Task {
  id: number;
  Title: string;
  Description: string;
  AssignTo: string;
  Assignee: string;
  Status: string;
}

interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  setLoading: (loading: boolean) => void;
  fetchTasks: () => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await TaskService.getTasks();
      if (data.isSuccess === false) {
        setError(data.message || "Failed to fetch tasks");
        setTasks([]);
      } else {
        setTasks(data.result || []);
        console.log("Fetched tasks:", data.result);
      }
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
      setError("Something went wrong while fetching tasks.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const checkAndFetchTasks = async () => {
      try {
        const token = await SecureStore.getItemAsync("jwtToken");
        if (token) {
          fetchTasks();
        } else {
          console.log("User not logged in, skipping fetch");
        }
      } catch (err) {
        console.error("Error checking token:", err);
      }
    };

    checkAndFetchTasks();
  }, []);

  return (
    <TaskContext.Provider
      value={{ tasks, loading, error, fetchTasks, setLoading }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) throw new Error("useTasks must be used inside TaskProvider");
  return context;
};
