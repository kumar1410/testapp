import { AppButton } from "@/components/ui-kit/AppButton";
import { useAuth } from "@/context/AuthContext";
import { useTasks } from "@/context/TaskContext";
import { sendOtp, verifyOtp, testLogin } from "@/services/auth";
import { Input, Layout, Text, Card } from "@ui-kitten/components";
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
  ScrollView,
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
  const [lastLoginResponse, setLastLoginResponse] = useState<any>(null);
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
      setLastLoginResponse(null);
      
      if (!testUsername) {
        setError("Please enter a test username");
        return;
      }

      const response = await testLogin({ username: testUsername });
      console.log('Test login response:', response);
      setLastLoginResponse(response);
      
      if (response.isSuccess && response.result?.token) {
        await secureStore.setItemAsync("jwtToken", response.result.token);
        login(response.result.token);
        
        Alert.alert(
          "Login Successful",
          `Welcome ${response.result.user.name || response.result.user.username}!\nRole: ${response.result.user.role}`,
          [{ text: "Continue", onPress: () => router.replace("/(main)") }]
        );
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
        if (phone.length < 10) {
          setError("Enter a valid phone number");
          return;
        }
        setError("");
        console.log('Attempting to send OTP to:', phone);
        const result = await sendOtp({ phoneNo: phone });
        console.log("OTP send response:", result);

        if (result.isSuccess) {
          setOtpSent(true);
          Alert.alert("OTP Sent", "Please check your phone for the OTP code.");
        } else {
          setError(result.errorMessages?.[0] || "Failed to send OTP");
        }
      } else {
        if (!otp) {
          setError("Please enter the OTP");
          return;
        }
        console.log('Attempting to verify OTP:', { phoneNo: phone, otp });
        const response = await verifyOtp({ phoneNo: phone, otp });
        setLastLoginResponse(response);
        console.log("Verify response:", response);

        if (response.isSuccess && response.result?.token) {
          await secureStore.setItemAsync("jwtToken", response.result.token);
          login(response.result.token);
          Alert.alert(
            "Login Successful",
            "Welcome back!",
            [{ text: "Continue", onPress: () => router.replace("/(main)") }]
          );
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text category="h1" style={styles.title}>
            Login
          </Text>

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

          <View style={styles.loginTypeSwitcher}>
            <TouchableOpacity 
              style={[styles.switchButton, !isTestLogin && styles.activeSwitchButton]} 
              onPress={() => {
                setIsTestLogin(false);
                setError("");
                setLastLoginResponse(null);
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
                setLastLoginResponse(null);
              }}>
              <Text style={[styles.switchButtonText, isTestLogin && styles.activeSwitchButtonText]}>
                Test Login
              </Text>
            </TouchableOpacity>
          </View>

          {isTestLogin ? (
            <>
              <Card style={styles.testCredentialsCard}>
                <Text category="h6" style={styles.credentialsTitle}>Available Test Users:</Text>
                <View style={styles.credentialsList}>
                  <View style={styles.credentialItem}>
                    <Text style={styles.credentialUsername}>admin</Text>
                    <Text style={styles.credentialDesc}>Full system access</Text>
                  </View>
                  <View style={styles.credentialItem}>
                    <Text style={styles.credentialUsername}>test</Text>
                    <Text style={styles.credentialDesc}>Limited test access</Text>
                  </View>
                  <View style={styles.credentialItem}>
                    <Text style={styles.credentialUsername}>demouser</Text>
                    <Text style={styles.credentialDesc}>Demo access only</Text>
                  </View>
                </View>
              </Card>
              
              <Input
                style={styles.input}
                placeholder="Enter test username"
                value={testUsername}
                onChangeText={(text) => {
                  setError("");
                  setTestUsername(text);
                  setLastLoginResponse(null);
                }}
              />
              
              <AppButton
                onPress={handleTestLogin}
                style={styles.button}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#fff" /> : "Login as Test User"}
              </AppButton>

              {lastLoginResponse && (
                <Card style={styles.responseCard}>
                  <Text category="h6" style={styles.responseTitle}>Login Response:</Text>
                  <Text style={styles.responseText}>
                    Status: {lastLoginResponse.isSuccess ? "Success" : "Failed"}
                  </Text>
                  {lastLoginResponse.isSuccess && lastLoginResponse.result?.user && (
                    <>
                      <Text style={styles.responseText}>User: {lastLoginResponse.result.user.username}</Text>
                      <Text style={styles.responseText}>Role: {lastLoginResponse.result.user.role}</Text>
                      <Text style={styles.responseText}>Name: {lastLoginResponse.result.user.name}</Text>
                    </>
                  )}
                </Card>
              )}
            </>
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
              <AppButton
                onPress={handleLoginOrVerify}
                style={styles.button}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#fff" /> : otpSent ? "Verify OTP" : "Send OTP"}
              </AppButton>

              {lastLoginResponse && (
                <Card style={styles.responseCard}>
                  <Text category="h6" style={styles.responseTitle}>Login Response:</Text>
                  <Text style={styles.responseText}>
                    Status: {lastLoginResponse.isSuccess ? "Success" : "Failed"}
                  </Text>
                  {lastLoginResponse.errorMessages?.map((msg: string, i: number) => (
                    <Text key={i} style={styles.responseError}>{msg}</Text>
                  ))}
                </Card>
              )}
            </>
          )}

          <TouchableOpacity
            style={styles.signupLink}
            onPress={() => router.push("/signup")}
          >
            <Text style={styles.signupText}>Don't have an account? Sign up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
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
    marginBottom: 20,
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
  testCredentialsCard: {
    width: "100%",
    marginBottom: 15,
    backgroundColor: "#f5f5f5",
  },
  credentialsTitle: {
    marginBottom: 10,
    color: "#1976D2",
  },
  credentialsList: {
    gap: 8,
  },
  credentialItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  credentialUsername: {
    fontWeight: "bold",
    color: "#2196F3",
  },
  credentialDesc: {
    color: "#757575",
    fontSize: 12,
  },
  responseCard: {
    width: "100%",
    marginTop: 15,
    backgroundColor: "#f5f5f5",
  },
  responseTitle: {
    marginBottom: 8,
    color: "#1976D2",
  },
  responseText: {
    marginBottom: 4,
    color: "#424242",
  },
  responseError: {
    color: "#f44336",
    marginTop: 4,
  },
});