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
  const [hasToken, setHasToken] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    const checkToken = async () => {
      try {
        const token = await SecureStore.getItemAsync("jwtToken");
        if (!cancelled) {
          setHasToken(!!token);
          setReady(true);
        }
      } catch (error) {
        console.error("Error getting token:", error);
        if (!cancelled) {
          setHasToken(false);
          setReady(true);
        }
      }
    };

    checkToken(); // Call the async function

    // Return cleanup function directly (not from async function)
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    console.log("Auth token present:", hasToken);
  }, [hasToken]);

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
              {hasToken === null ? null : hasToken ? (
                <Redirect href="/(main)" />
              ) : (
                <Redirect href="/(auth)/login" />
              )}
              {hasToken !== null && (
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
              )}
              {/* <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(main)" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" /> */}
            </TaskProvider>
          </AuthProvider>
          <StatusBar style="auto" />
        </ThemeProvider>
      </ApplicationProvider>
    </>
  );
}
