import { AppButton } from "@/components/ui-kit/AppButton";
import { useAuth } from "@/context/AuthContext";
import { useTasks } from "@/context/TaskContext";
import { sendOtp, verifyOtp, testLogin } from "@/services/auth";
import { Input, Layout, Text } from "@ui-kitten/components";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { registerPushToken } from "@/services/notifications";
import { useRouter } from "expo-router";
import * as secureStore from "expo-secure-store";
import React, { useState, useEffect } from "react";
import { pingBackend } from "@/services/pingBackend";
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";

export default function LoginScreen() {
  const { login } = useAuth();
  const { loading, setLoading } = useTasks();
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isTestLogin, setIsTestLogin] = useState(false);
  const [testUsername, setTestUsername] = useState("");
  const [backendStatus, setBackendStatus] = useState<{connected: boolean, status: string, message: string} | null>(null);

  useEffect(() => {
    let mounted = true;
    pingBackend().then((res) => {
      if (mounted) setBackendStatus(res);
    });
    return () => { mounted = false; };
  }, []);

  const handleTestLogin = async () => {
    try {
      setLoading(true);
      setError("");
      
      if (!testUsername) {
        setError("Please enter a username");
        return;
      }

      console.log("Starting test login with username:", testUsername);
      const response = await testLogin({ username: testUsername });
      console.log("Test login response:", response);
      
      if (response.isSuccess && response.result?.token && typeof response.result.token === 'string') {
        console.log("Login successful, saving token and navigating");
        await secureStore.setItemAsync("jwtToken", response.result.token);
        login(response.result.token);
        router.replace("/(main)");
      } else {
        console.log("Login failed:", response.errorMessages);
        setError(response.errorMessages?.[0] || "Login failed");
      }
    } catch (err: any) {
      console.error("Test login error:", err);
      setError(err.response?.data?.errorMessages?.[0] || "Login failed");
    } finally {
      setLoading(false);
    }
  };

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
        console.log('Attempting to send OTP to:', phone);
        const result = await sendOtp({ phoneNo: phone });
        console.log("OTP send response:", result);
        
        if (result && result.isSuccess) {
          console.log('OTP sent successfully');
          setLoading(false);
          setOtpSent(true); // Switch to OTP input
        } else {
          console.error('OTP send error:', result);
          const backendError = result?.errorMessages?.[0] || result?.result?.message || "Failed to send OTP";
          setError(backendError);
          setLoading(false);
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
          const backendError = response?.result?.message || "OTP verification failed";
          setError(backendError);
        }
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


      {/* Phone number input */}
      <Input
        label="Phone Number"
        placeholder="Enter your phone number"
        value={phone}
        onChangeText={setPhone}
        style={styles.input}
        keyboardType="phone-pad"
        maxLength={15}
        autoCapitalize="none"
        editable={!loading && !otpSent}
      />

      {/* OTP input, only show after OTP is sent */}
      {otpSent && (
        <Input
          label="OTP"
          placeholder="Enter OTP"
          value={otp}
          onChangeText={setOtp}
          style={styles.input}
          keyboardType="number-pad"
          maxLength={8}
          autoCapitalize="none"
          editable={!loading}
        />
      )}

            {!!error && (
        <Text status="danger" style={styles.error}>
          {error}
        </Text>
      )}

      {/* Main buttons */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#3D5AFE"
          style={{ marginTop: 12 }}
        />
      ) : (
        <>
          {/* OTP Flow Button */}
          <AppButton
            style={styles.button}
            status="primary"
            onPress={handleLoginOrVerify}
          >
            {otpSent ? "Verify OTP" : "Send OTP"}
          </AppButton>

          {/* Test Login Navigation */}
          <AppButton
            style={[styles.button, styles.secondaryButton]}
            status="basic"
            onPress={() => router.push("/test-login")}
          >
            Test Login (Skip OTP)
          </AppButton>
        </>
      )}

      {/* Only show signup link if not admin mode and not OTP */}
      {!otpSent && (
        <View style={styles.footer}>
          <Text appearance="hint">Don&apos;t have an account?</Text>
          <TouchableOpacity onPress={() => router.push("/signup")}>
            <Text style={styles.link}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      )}
      {/* Backend status at bottom */}
      <View style={{ alignItems: "center", marginTop: 24 }}>
        <Text
          style={{
            color: backendStatus?.connected ? "green" : "red",
            fontSize: 13,
            marginTop: 8,
          }}
        >
          {backendStatus
            ? backendStatus.connected
              ? `Connected to Render backend: ${backendStatus.status}`
              : `Not connected to backend: ${backendStatus.status}`
            : "Checking backend connection..."}
        </Text>
      </View>
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
  secondaryButton: {
    marginTop: 8,
  },
  error: {
    marginBottom: 8,
    textAlign: "center",
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
  statusContainer: {
    alignItems: "center",
    marginTop: 24,
  },
});
