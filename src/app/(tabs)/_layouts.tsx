import { useAuth } from "@/src/hooks/use-auth";
import { Redirect, Stack } from "expo-router";

export default function TabsLayout() {
    const {session} = useAuth();    

    if(!session) {
        return <Redirect href="/(auth)/register" />
    }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" />
    </Stack>
  );
}