import axios from "axios";

const publicApi = process.env.EXPO_PUBLIC_API_URL;
let url = publicApi || "https://testapp-4x8g.onrender.com";

export const pingBackend = async () => {
  try {
    const res = await axios.get(url + "/");
    if (res.status === 200) {
      return {
        connected: true,
        status: "Connected to Backend",
        message: "Backend service running on Render",
        details: res.data
      };
    }
    return {
      connected: false,
      status: "Not Connected",
      message: "Cannot reach backend service on Render",
      details: null
    };
  } catch (e) {
    return {
      connected: false,
      status: "Connection Failed",
      message: "Backend service unavailable on Render",
      details: null
    };
  }
};
