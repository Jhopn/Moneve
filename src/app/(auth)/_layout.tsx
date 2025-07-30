import { useAuth } from "@/src/hooks/use-auth";
import { Redirect, Stack } from "expo-router";

export default function AuthLayout() {
    const { session } = useAuth();

    if (session) {
        return <Redirect href="/(tabs)/dashboard" />
    }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="register" />
    </Stack>
  );
}