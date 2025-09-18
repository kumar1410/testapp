import { AppButton } from "@/components/ui-kit/AppButton";
import { useAuth } from "@/context/AuthContext";
import { useTasks } from "@/context/TaskContext";
import { sendOtp, verifyOtp, testLogin } from "@/services/auth";
import { Input, Layout, Text } from "@ui-kitten/components";
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
  const [backendStatus, setBackendStatus] = useState<{connected: boolean, status: string, message: string, details?: any} | null>(null);

  useEffect(() => {
    let mounted = true;
    const checkBackend = async () => {
      try {
        const res = await pingBackend();
        if (mounted) {
          setBackendStatus(res);
          console.log('Backend details:', res.details);
        }
      } catch (err) {
        console.error('Backend check failed:', err);
      }
    };
    checkBackend();
    return () => { mounted = false; };
  }, []);

  const handleTestLogin = async () => {
    try {
      setLoading(true);
      setError("");
      
      if (!testUsername) {
        setError("Please enter username");
        return;
      }

      const response = await testLogin({ username: testUsername });
      console.log('Test login response:', response);
      
      if (response.isSuccess && response.result?.token) {
        // Save the token
        await secureStore.setItemAsync("jwtToken", response.result.token);
        // Update auth context
        login(response.result.token);
        // Get push token for notifications
        await registerPushToken();
        // Navigate to main app
        router.replace("/(main)");
      } else {
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
        // Send OTP
        if (phone.length < 10) {
          setError("Enter a valid phone number");
          return;
        }
        setError("");
        console.log('Sending OTP to:', phone);
        const result = await sendOtp({ phoneNo: phone });
        console.log("OTP send response:", result);

        if (result.isSuccess) {
          setOtpSent(true);
          Alert.alert("OTP Sent", "Please check your phone for the verification code.");
        } else {
          setError(result.errorMessages?.[0] || "Failed to send OTP");
        }
      } else {
        // Verify OTP
        if (!otp) {
          setError("Please enter the OTP");
          return;
        }
        console.log('Verifying OTP:', { phoneNo: phone, otp });
        const response = await verifyOtp({ phoneNo: phone, otp });
        console.log("OTP verification response:", response);

        if (response.isSuccess && response.result?.token) {
          // Save the token
          await secureStore.setItemAsync("jwtToken", response.result.token);
          // Update auth context
          login(response.result.token);
          // Get push token for notifications
          await registerPushToken();
          // Navigate to main app
          router.replace("/(main)");
        } else {
          setError(response.errorMessages?.[0] || "Invalid OTP");
        }
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.response?.data?.errorMessages?.[0] || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={styles.container}>
      <View style={styles.content}>
        <Text category="h1" style={styles.title}>
          Login
        </Text>

        {/* Backend Status Banner */}
        {backendStatus && (
          <View style={[styles.statusBanner, 
            {backgroundColor: backendStatus.connected ? '#4CAF50' : '#f44336'}]}>
            <Text style={styles.statusText}>
              {backendStatus.message}
            </Text>
          </View>
        )}

        {error ? (
          <Text status="danger" style={styles.error}>
            {error}
          </Text>
        ) : null}

        {/* Login Type Switcher */}
        <View style={styles.loginTypeSwitcher}>
          <TouchableOpacity 
            style={[styles.switchButton, !isTestLogin && styles.activeSwitchButton]} 
            onPress={() => {
              setIsTestLogin(false);
              setError("");
            }}>
            <Text style={[styles.switchButtonText, !isTestLogin && styles.activeSwitchButtonText]}>
              Phone Login
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.switchButton, isTestLogin && styles.activeSwitchButton]} 
            onPress={() => {
              setIsTestLogin(true);
              setError("");
              setOtpSent(false);
            }}>
            <Text style={[styles.switchButtonText, isTestLogin && styles.activeSwitchButtonText]}>
              Test Login
            </Text>
          </TouchableOpacity>
        </View>

        {/* Login Form */}
        {isTestLogin ? (
          <Input
            style={styles.input}
            placeholder="Username"
            value={testUsername}
            onChangeText={(text) => {
              setError("");
              setTestUsername(text);
            }}
          />
        ) : (
          <>
            <Input
              style={styles.input}
              placeholder="Phone Number"
              value={phone}
              onChangeText={(text) => {
                setError("");
                setPhone(text);
              }}
              keyboardType="phone-pad"
            />
            {otpSent && (
              <Input
                style={styles.input}
                placeholder="Enter OTP"
                value={otp}
                onChangeText={(text) => {
                  setError("");
                  setOtp(text);
                }}
                keyboardType="number-pad"
              />
            )}
          </>
        )}

        {/* Action Button */}
        <AppButton
          onPress={isTestLogin ? handleTestLogin : handleLoginOrVerify}
          style={styles.button}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : isTestLogin ? (
            "Login"
          ) : otpSent ? (
            "Verify OTP"
          ) : (
            "Send OTP"
          )}
        </AppButton>

        {/* Signup Link */}
        <TouchableOpacity
          style={styles.signupLink}
          onPress={() => router.push("/signup")}
        >
          <Text style={styles.signupText}>Don't have an account? Sign up</Text>
        </TouchableOpacity>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    marginBottom: 30,
    fontSize: 32,
  },
  input: {
    marginBottom: 15,
    width: "100%",
  },
  button: {
    width: "100%",
    marginTop: 10,
  },
  error: {
    marginBottom: 15,
    textAlign: "center",
    color: "#f44336",
  },
  signupLink: {
    marginTop: 20,
  },
  signupText: {
    color: "#2196F3",
  },
  statusBanner: {
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
    width: "100%",
  },
  statusText: {
    color: "white",
    textAlign: "center",
  },
  loginTypeSwitcher: {
    flexDirection: "row",
    marginBottom: 20,
    width: "100%",
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  switchButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  activeSwitchButton: {
    backgroundColor: "#2196F3",
  },
  switchButtonText: {
    color: "#757575",
  },
  activeSwitchButtonText: {
    color: "#ffffff",
  },
});