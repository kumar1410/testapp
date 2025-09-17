import { AppButton } from "@/components/ui-kit/AppButton";
import { signUp } from "@/services/auth";
import { Input, Layout, Text } from "@ui-kitten/components";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export default function SignupScreen() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignup = async () => {
    if (!name || phone.length < 10) {
      setError("Fill all fields correctly");
      return;
    }
    try {
      const res = await signUp({ name, phoneno: phone });
      if (res.statusCode === 201 && res.isSuccess) {
        setError("");
        setSuccess("Signup successful! Redirecting to login..."); // ✅ show success
        setTimeout(() => {
          router.replace("/(auth)/login");
        }, 1500);
      } else {
        setError("Signup failed");
      }
    } catch {
      setError("Signup failed");
    }
  };

  return (
    <Layout style={styles.container}>
      <Text category="h5" style={styles.title}>
        Sign Up
      </Text>
      <Input
        label="Name"
        placeholder="Enter your name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <Input
        label="Phone Number"
        placeholder="Enter your phone number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        style={styles.input}
        maxLength={10}
      />
      {/* <Input
        label="Password"
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      /> */}
      {!!error && (
        <Text status="danger" style={styles.error}>
          {error}
        </Text>
      )}
      {/* ✅ Success */}
      {!!success && (
        <Text status="success" style={styles.success}>
          {success}
        </Text>
      )}
      <AppButton style={styles.button} status="primary" onPress={handleSignup}>
        Sign Up
      </AppButton>
      <View style={styles.footer}>
        <Text appearance="hint">Already have an account?</Text>
        <TouchableOpacity onPress={() => router.push("/login")}>
          <Text style={styles.link}>Login</Text>
        </TouchableOpacity>
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
  error: {
    marginBottom: 8,
  },
  success: {
    marginBottom: 8,
    color: "green", 
    fontWeight: "600",
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
