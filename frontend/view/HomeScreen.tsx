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
      imageStyle={{ resizeMode: "cover"}}
      style={styles.container}
    >
      <Image source={require("../assets/logo.png")} style={styles.logoImg} />
      <ImageBackground
        source={require("../assets/searchBarBackground.png")}
        style={styles.searchBarContainer}
        imageStyle={styles.searchBarBackgroundImg}
      >
        <TextInput
          style={styles.searchBarTextInput}
          placeholder="where do you wanna go?"
          placeholderTextColor={colors.white}
          value={text}
          onChangeText={(newText) => {
            setText(newText);
          }}
          onSubmitEditing={(e) => {
            mooveToMapScreen(text);
          }}
        />
      </ImageBackground>
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
  backgroundImg:{
    resizeMode:"cover"
  },

  logoImg: {
    // size
    width: "70%",
    height: "auto",
    aspectRatio: 1,
    resizeMode: "contain",
  },

  searchBarContainer: {
    width: "70%",
    height: 70,
    justifyContent: "center",
    alignItems: "center",
  },
  searchBarBackgroundImg: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  searchBarTextInput: {
    // colors
    color: colors.white,
    // size
    width: "80%",
    height: "80%",

    // text
    textAlign: "center",
    fontSize: 20,
    fontWeight: 900,
  },
});
