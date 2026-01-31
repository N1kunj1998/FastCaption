import { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Index() {
  const [hasOnboarded, setHasOnboarded] = useState(null);

  useEffect(() => {
    async function checkOnboarding() {
      const onboarded = await AsyncStorage.getItem("hasOnboarded");
      setHasOnboarded(onboarded === "true");
    }
    checkOnboarding();
  }, []);

  if (hasOnboarded === null) {
    return null;
  }

  return <Redirect href={hasOnboarded ? "/(tabs)" : "/onboarding"} />;
}
