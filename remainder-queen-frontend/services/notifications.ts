import apiClient from "@/config/axiosConfig";

export async function registerPushToken(token: string, platform?: "ios" | "android") {
  const { data } = await apiClient.post("/notifications/register", {
    token,
    platform,
  });
  return data;
}

export async function unregisterPushToken(token: string) {
  const { data } = await apiClient.post("/notifications/unregister", {
    token,
  });
  return data;
}


