import "react-native-gesture-handler";
import * as eva from "@eva-design/eva";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { ApplicationProvider, IconRegistry } from "@ui-kitten/components";
import { EvaIconsPack } from "@ui-kitten/eva-icons";
import { useFonts } from "expo-font";
import { Redirect, Stack } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";
// import { testLogin } from "@/services/auth";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import "react-native-reanimated";

import { AuthProvider } from "@/context/AuthContext";
import { TaskProvider } from "@/context/TaskContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { ActivityIndicator, View } from "react-native";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
  });

  const [ready, setReady] = React.useState(false);
  const [initialRoute, setInitialRoute] = React.useState<"/(main)" | "/(auth)/login" | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    const initializeApp = async () => {
      try {
        const token = await SecureStore.getItemAsync("jwtToken");
        if (!cancelled) {
        if (token) {
          // If we have a token, decode it to check expiration
          try {
            const decoded: any = jwtDecode(token);
            const currentTime = Date.now() / 1000;
            if (decoded.exp && decoded.exp > currentTime) {
              // Token is valid
              setInitialRoute("/(main)");
            } else {
              // Token expired
              await SecureStore.deleteItemAsync("jwtToken");
              setInitialRoute("/(main)");
            }
          } catch (err) {
            // Invalid token
            console.error("Invalid token:", err);
            await SecureStore.deleteItemAsync("jwtToken");
            setInitialRoute("/(main)");
          }
        } else {
          // No token
          setInitialRoute("/(main)");
        }
          setReady(true);
        }
      } catch (error) {
        console.error("Error initializing app:", error);
        if (!cancelled) {
          setInitialRoute("/(auth)/login");
          setReady(true);
        }
      }
    };

    initializeApp();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!loaded || !ready) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#3366FF" />
      </View>
    );
  }

  return (
    <>
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider {...eva} theme={eva.light}>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <AuthProvider>
            <TaskProvider>
              {initialRoute && <Redirect href={initialRoute} />}
              <Stack
                screenOptions={{
                  headerShown: false,
                  headerStyle: { backgroundColor: "#FFFFFF" },
                  headerTitleStyle: { fontFamily: "Poppins-SemiBold" },
                  headerTintColor: "#11181C",
                  headerBackTitle: " ",
                  headerShadowVisible: false,
                }}
              />
            </TaskProvider>
          </AuthProvider>
          <StatusBar style="auto" />
        </ThemeProvider>
      </ApplicationProvider>
    </>
  );
}
