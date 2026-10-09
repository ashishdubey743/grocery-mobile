import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { useAuth } from "../store/AuthContext";
import { Loading } from "../components/UI";
import { colors } from "../theme";

import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import UserTabs from "./UserTabs";
import ProductDetailScreen from "../screens/user/ProductDetailScreen";
import OrderDetailScreen from "../screens/user/OrderDetailScreen";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) return <Loading text="Starting up..." />;

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.white,
          headerTitleStyle: { fontWeight: "800" },
        }}
      >
        {!user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ title: "Create account" }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Tabs" component={UserTabs} options={{ headerShown: false }} />
            <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: "Product" }} />
            <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: "Order details" }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
