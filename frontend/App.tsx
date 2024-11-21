import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React, { StrictMode } from "react";
import { StyleSheet, Text, View } from "react-native";
import HomeScreen from "./screens/HomeScreen";
import MapScreen from "./screens/MapScreen";
import { RootStackParamList } from "./types";

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <StrictMode>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="home" component={HomeScreen} />
          <Stack.Screen name="map" component={MapScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </StrictMode>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
