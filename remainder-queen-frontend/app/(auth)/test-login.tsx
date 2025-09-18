import { AppButton } from "@/components/ui-kit/AppButton";
import { useAuth } from "@/context/AuthContext";
import { testLogin } from "@/services/auth";
import { Input, Layout, Text } from "@ui-kitten/components";
import { useRouter } from "expo-router";
import * as secureStore from "expo-secure-store";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";

export default function TestLoginScreen() {
  const { login } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTestLogin = async () => {
    if (!username) {
      setError("Please enter test credentials");
      return;
    }
    setLoading(true);
    setError("");
    try {
      console.log('Starting test login with username:', username);
      const response = await testLogin({ username });
      console.log('Test login response:', response);
      
      if (response && response.isSuccess && response.result?.token) {
        console.log('Login successful, saving token');
        await secureStore.setItemAsync("jwtToken", response.result.token);
        login(response.result.token);
        router.replace("/");
      } else {
        console.error('Login response format error:', response);
        setError(response?.errorMessages?.[0] || response?.result?.message || "Invalid test credentials");
      }
    } catch (err: any) {
      console.error('Login error:', err.response?.data || err.message);
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={styles.container}>
      <Text category="h5" style={styles.title}>Test Login</Text>

      <Text appearance="hint" style={styles.hint}>
        Available test accounts: admin, test, demouser
      </Text>

      <Input
        label="Test Credentials"
        placeholder="Enter test username"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
        autoCapitalize="none"
        editable={!loading}
      />

      {!!error && (
        <Text status="danger" style={styles.error}>
          {error}
        </Text>
      )}

      <AppButton
        style={styles.button}
        status="primary"
        onPress={handleTestLogin}
        disabled={loading || !username}
      >
        {loading ? "Logging in..." : "Test Login"}
      </AppButton>

      <View style={styles.footer}>
        <Text appearance="hint">Want to use phone number?</Text>
        <AppButton
          style={styles.linkButton}
          appearance="ghost"
          status="info"
          onPress={() => router.back()}
        >
          Back to Login
        </AppButton>
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
  hint: {
    textAlign: "center",
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginTop: 8,
  },
  error: {
    marginBottom: 16,
    textAlign: "center",
  },
  footer: {
    alignItems: "center",
    marginTop: 24,
    gap: 8,
  },
  linkButton: {
    margin: 0,
    padding: 0,
  },
});