import React, { useState } from "react";
import { StyleSheet, View, Image, ImageBackground } from "react-native";
import colors from "../data/colors.const";
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
    <ImageBackground
      source={require("../assets/beachBackground.jpg")}
      style={styles.container}
    >
      <Image source={require("../assets/logo.png")} style={styles.logo} />
      <TextInput
        style={styles.searchBar}
        placeholder="where do you wanna go?"
        placeholderTextColor={colors.darkBlue3}
        value={text}
        onChangeText={(newText) => {
          setText(newText);
        }}
        onSubmitEditing={(e) => {
          mooveToMapScreen(text);
        }}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    // size
    width: "100%",
    height: "100%",

    // children
    alignItems: "center",
    justifyContent: "center",
  },

  logo: {
    // size
    width: "70%",
    height: "auto",
    aspectRatio: 1,
  },
  searchBar: {
    // colors
    backgroundColor: colors.lightYellow3,
    color: colors.darkBlue3,

    borderRadius:20,
    borderColor:colors.lightOrange1,
    borderWidth:4,
    // size
    width: "70%",
    height: 60,

    // text
    textAlign: "center",
    fontSize: 20,
    fontWeight: 900,
  },
});
