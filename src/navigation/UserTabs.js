import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import ShopScreen from "../screens/user/ShopScreen";
import CartScreen from "../screens/user/CartScreen";
import OrdersScreen from "../screens/user/OrdersScreen";
import CardScreen from "../screens/user/CardScreen";
import ProfileScreen from "../screens/user/ProfileScreen";
import AdminStack from "./AdminStack";

import { useAuth } from "../store/AuthContext";
import { useCart } from "../store/CartContext";
import { colors } from "../theme";

const Tab = createBottomTabNavigator();

const ICONS = {
  ShopTab: "storefront-outline",
  CartTab: "cart-outline",
  OrdersTab: "receipt-outline",
  CardTab: "card-outline",
  ProfileTab: "person-outline",
  AdminTab: "settings-outline",
};

export default function UserTabs() {
  const { isAdmin } = useAuth();
  const { count } = useCart();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { height: 60, paddingBottom: 8, paddingTop: 6 },
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={ICONS[route.name] || "ellipse-outline"} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="ShopTab" component={ShopScreen} options={{ title: "Shop" }} />
      <Tab.Screen
        name="CartTab"
        component={CartScreen}
        options={{ title: "Cart", tabBarBadge: count > 0 ? count : undefined }}
      />
      <Tab.Screen name="OrdersTab" component={OrdersScreen} options={{ title: "Orders" }} />
      <Tab.Screen name="CardTab" component={CardScreen} options={{ title: "Card" }} />
      {isAdmin && <Tab.Screen name="AdminTab" component={AdminStack} options={{ title: "Admin" }} />}
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: "Profile" }} />
    </Tab.Navigator>
  );
}
