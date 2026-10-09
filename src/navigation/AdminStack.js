import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { colors } from "../theme";

import AdminHomeScreen from "../screens/admin/AdminHomeScreen";
import AdminProductsScreen from "../screens/admin/AdminProductsScreen";
import AdminProductFormScreen from "../screens/admin/AdminProductFormScreen";
import AdminCategoriesScreen from "../screens/admin/AdminCategoriesScreen";
import AdminOrdersScreen from "../screens/admin/AdminOrdersScreen";
import AdminOrderDetailScreen from "../screens/admin/AdminOrderDetailScreen";
import AdminUsersScreen from "../screens/admin/AdminUsersScreen";
import AdminUserDetailScreen from "../screens/admin/AdminUserDetailScreen";

const Stack = createNativeStackNavigator();

export default function AdminStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: "800" },
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen name="AdminHome" component={AdminHomeScreen} options={{ title: "Admin" }} />
      <Stack.Screen name="AdminProducts" component={AdminProductsScreen} options={{ title: "Products" }} />
      <Stack.Screen name="AdminProductForm" component={AdminProductFormScreen} options={{ title: "Product" }} />
      <Stack.Screen name="AdminCategories" component={AdminCategoriesScreen} options={{ title: "Categories & Points" }} />
      <Stack.Screen name="AdminOrders" component={AdminOrdersScreen} options={{ title: "Orders" }} />
      <Stack.Screen name="AdminOrderDetail" component={AdminOrderDetailScreen} options={{ title: "Order" }} />
      <Stack.Screen name="AdminUsers" component={AdminUsersScreen} options={{ title: "Customers" }} />
      <Stack.Screen name="AdminUserDetail" component={AdminUserDetailScreen} options={{ title: "Customer" }} />
    </Stack.Navigator>
  );
}
