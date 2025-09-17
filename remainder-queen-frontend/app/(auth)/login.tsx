import { AppButton } from "@/components/ui-kit/AppButton";
import { useAuth } from "@/context/AuthContext";
import { useTasks } from "@/context/TaskContext";
import { sendOtp, verifyOtp } from "@/services/auth";
import { Input, Layout, Text } from "@ui-kitten/components";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { registerPushToken } from "@/services/notifications";
import { useRouter } from "expo-router";
import * as secureStore from "expo-secure-store";
import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

export default function LoginScreen() {
  const { login } = useAuth();
  const { loading, setLoading } = useTasks();
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const handleLoginOrVerify = async () => {
    try {
      setLoading(true);
      if (!otpSent) {
        // 🔹 Step 1: Send OTP
        if (phone.length < 10) {
          setError("Enter a valid phone number");
          return;
        }
        setError("");
        const result = await sendOtp({ phoneNo: phone });
        console.log("body", result);
        if (result.isSuccess) {
          setLoading(false);
          setOtpSent(true); // Switch to OTP input
          console.log(result.result.message);
        }
      } else {
        // 🔹 Step 2: Verify OTP (replace with API later)
        if (otp.length < 6) {
          setError("Enter a valid OTP");
          return;
        }
        const response = await verifyOtp({ phoneNo: phone, otp });

        if (response && response.isSuccess) {
          secureStore.setItemAsync("jwtToken", response.result.token);
          setLoading(false);
          login(response.result.token);
          // Register device push token (best-effort)
          try {
            if (Device.isDevice) {
              const perms = await Notifications.getPermissionsAsync();
              const final =
                perms.status === "granted"
                  ? perms
                  : await Notifications.requestPermissionsAsync();
              if (final.status === "granted") {
                const pushToken = await Notifications.getDevicePushTokenAsync();
                const platform = Device.osName?.toLowerCase().includes("ios")
                  ? "ios"
                  : "android";
                await registerPushToken(pushToken.data, platform as any);
              }
            }
          } catch (e) {
            console.log("Push token registration failed", e);
          }
          router.replace("/");
        } else {
          // setError(response.message);
          console.log("error");
        }
        setError("");
        console.log("Verifying OTP:", otp);
      }
    } catch (error) {
      setLoading(false);
      console.error("Error:", error);
      setError("Something went wrong. Try again.");
    }
  };

  return (
    <Layout style={styles.container}>
      <Text category="h5" style={styles.title}>
        Login
      </Text>

      {/* Phone Input */}
      {!otpSent && (
        <Input
          label="Phone Number"
          placeholder="Enter your phone number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          style={styles.input}
          maxLength={10}
        />
      )}

      {/* OTP Input */}
      {otpSent && (
        <Input
          label="OTP"
          placeholder="Enter OTP"
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
          style={styles.input}
          maxLength={6}
        />
      )}

      {!!error && (
        <Text status="danger" style={styles.error}>
          {error}
        </Text>
      )}

      {/* Button changes dynamically */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#3D5AFE"
          style={{ marginTop: 12 }}
        />
      ) : (
        <AppButton
          style={styles.button}
          status="primary"
          onPress={handleLoginOrVerify}
        >
          {otpSent ? "Verify OTP" : "Login"}
        </AppButton>
      )}
      {/* <AppButton
        style={styles.button}
        status="primary"
        onPress={handleLoginOrVerify}
      >
        {otpSent ? "Verify OTP" : "Login"}
      </AppButton> */}

      {!otpSent && (
        <View style={styles.footer}>
          {/* <Text appearance="hint">{"Don't have an account?"}</Text> */}
          <Text appearance="hint">Don&apos;t have an account?</Text>
          <TouchableOpacity onPress={() => router.push("/signup")}>
            <Text style={styles.link}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      )}
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#F7F9FC",
  },
  title: {
    marginBottom: 24,
    alignSelf: "center",
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginTop: 12,
  },
  error: {
    marginBottom: 8,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
    alignItems: "center",
    gap: 4,
  },
  link: {
    color: "#3D5AFE",
    marginLeft: 4,
    fontWeight: "bold",
  },
});
