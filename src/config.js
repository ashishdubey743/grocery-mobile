import Constants from "expo-constants";

const DEV_API_PORT = 4000;

function resolveDevHost() {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.expoGoConfig?.debuggerHost ||
    Constants.manifest2?.extra?.expoGo?.debuggerHost ||
    "";
  const host = String(hostUri).split(":")[0];
  return host || "localhost";
}

function resolveApiBase() {
  const configured = process.env.EXPO_PUBLIC_API_URL;
  if (configured) return configured.replace(/\/$/, "");

  if (__DEV__) {
    return `http://${resolveDevHost()}:${DEV_API_PORT}`;
  }

  throw new Error(
    "EXPO_PUBLIC_API_URL is not set. Set it in mobile/.env (or your build environment) to the deployed backend URL."
  );
}

export const API_BASE = resolveApiBase();
