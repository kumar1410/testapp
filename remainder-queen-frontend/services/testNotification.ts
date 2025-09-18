import apiClient from "@/config/axiosConfig";

export async function sendTestNotification() {
  // This endpoint should be implemented in the backend to send a test notification to the current user
  const { data } = await apiClient.post("/notifications/test");
  return data;
}
