import React, { useState } from "react";
import { StyleSheet, View, Image } from "react-native";
import colors from "../data/colors";
import { TextInput } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";
import { DetailsScreenNavigationProp } from "./navigation.types";

export default function HomeScreen() {
  const [text, setText] = useState("");
  const navigation = useNavigation<DetailsScreenNavigationProp>();

  const mooveToMapScreen = (text: String) => {
    navigation.navigate("map", { searchText: text.toString() });
  };

  return (
    <View style={styles.container}>
      <Image source={require("../assets/logo.png")} style={styles.logo} />
      <TextInput
        style={styles.searchBar}
        placeholder="where do you wanna go?"
        placeholderTextColor={colors.baseColor}
        value={text}
        onChangeText={(newText) => {
          setText(newText);
        }}
        onSubmitEditing={(e) => {
          mooveToMapScreen(text);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // colors
    backgroundColor: colors.baseColor,

    // size
    width: "100%",
    height: "100%",

    // children
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    // size
    width: "80%",
    height: 200,
    resizeMode: "contain",
  },
  searchBar: {
    // colors
    backgroundColor: colors.contrastColor,
    color: colors.baseColor,

    // size
    width: "80%",
    height: 60,

    // borders and spaces
    borderRadius: 20,
    margin: 10,
    padding: 20,

    // text
    textAlign: "center",
    fontSize: 20,
    fontWeight: 900,
  },
});
