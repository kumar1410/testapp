import apiClient from "../config/axiosConfig";

const TaskService = {
  createTask: async (data: any) => {
    const response = await apiClient.post("/task", data);
    return response.data;
  },

  getTasks: async () => {
    const response = await apiClient.get("/task");
    return response.data;
  },

  updateTask: async (id: string, data: any) => {
    const response = await apiClient.put(`/task/${id}`, data);
    return response.data;
  },

  updateTaskStatus: async (id: number, data: any) => {
    
    const response = await apiClient.put(`/task/${id}/status`, data);
    return response.data;
  },

  deleteTask: async (id: string) => {
    const response = await apiClient.delete(`/task/${id}`);
    return response.data;
  },

  getTaskById: async (id: number) => {
    const response = await apiClient.get(`/task/${id}`);
    return response.data;
  },
};

export default TaskService;
