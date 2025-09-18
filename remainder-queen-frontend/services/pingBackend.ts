import axios from "axios";

const publicApi = process.env.EXPO_PUBLIC_API_URL;
let url = publicApi || "https://testapp-4x8g.onrender.com";

export const pingBackend = async () => {
  try {
    const res = await axios.get(url + "/");
    if (res.status === 200 && res.data && res.data.status) {
      return { connected: true, status: res.data.status, message: res.data.message };
    }
    return { connected: false, status: "No status", message: "No message" };
  } catch (e) {
    return { connected: false, status: "Not connected", message: e?.message || "Error" };
  }
};
