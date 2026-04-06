import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { router, Stack, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { getSession } from "@/src/data/storage/authStorage";

export const unstable_settings = {
  anchor: "(auth)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const session = await getSession();

      const inAuth = pathname.startsWith("/(auth)");
      const inTabs = pathname.startsWith("/(tabs)");

      // Si NO hay sesión y quiere entrar a tabs => mandar a login
      if (!session && inTabs) {
        router.replace("/(auth)/login" as any);
      }

      // Si ya hay sesión y está en auth => mandar a tabs
      if (session && inAuth) {
        router.replace("/(tabs)");
      }

      setReady(true);
    })();
  }, [pathname]);

  if (!ready) return null;

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        {/* ZONA PROTEGIDA */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* MODAL */}
        <Stack.Screen name="modal" options={{ presentation: "modal", title: "Modal" }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
