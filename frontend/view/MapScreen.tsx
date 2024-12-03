import React, { useEffect, useState } from "react";
import { Text, StyleSheet, View, ImageBackground } from "react-native";
import MapView, {
  Marker,
  Circle,
  PROVIDER_GOOGLE,
  Callout,
} from "react-native-maps";
import { Pressable, TextInput } from "react-native-gesture-handler";
import searchZone from "../data/searchZone.const";
import colors from "../data/colors.const";
import {
  CircularBoundary,
  ParkingLot,
  PointOfInterest,
} from "../model/model.parKING.types";
import { MapScreenRouteProps } from "./navigation.types";
import { searchLocationMarkers } from "../controller/controller.openRouteService.func";
import { searchParkingLots } from "../controller/controller.parKING.func";

export default function MapScreen(props: { route: MapScreenRouteProps }) {
  const [searchText, setSearchText] = useState<string>(
    props.route.params.searchText
  );
  const [locations, setLocations] = useState<PointOfInterest[]>([]);
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
  const [boundary, setBoundary] = useState<CircularBoundary>({
    center: searchZone.center,
    radius: 300,
  });
  const [locationSelected, setLocationSelected] = useState<boolean>(false);

  useEffect(() => {
    searchLocationMarkers(searchText).then((locations) => {
      setLocations(locations);
    });
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.mapView}
        customMapStyle={customMapStyle}
        initialRegion={{
          latitude: searchZone.center.latitude,
          longitude: searchZone.center.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        region={{
          latitude: searchZone.center.latitude,
          longitude: searchZone.center.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        onPress={() => {
          setLocationSelected(false);
          setParkingLots([]);
        }}
      >
        {locations.map((l, index) => (
          <Marker
            title={l.name}
            coordinate={l.coordinate}
            pinColor="red"
            key={"location-marker" + index}
            onSelect={(e) => {
              const newBoundary = { ...boundary, center: l.coordinate };
              setLocationSelected(true);
              setBoundary(newBoundary);
              searchParkingLots(newBoundary, 10).then((parkingsLots) => {
                setParkingLots(parkingsLots);
              });
            }}
          />
        ))}
        {locationSelected && (
          <>
            <Circle
              center={{
                latitude: boundary.center.latitude,
                longitude: boundary.center.longitude,
              }}
              radius={boundary.radius}
              strokeColor={colors.red}
              fillColor={colors.transparentRed}
            />
            {parkingLots.map((pl, index) => (
              <Marker
                coordinate={pl.coordinate}
                title={pl.name}
                description={`posti :${pl.availableParkings}`}
                pinColor="blue"
                key={"parking-lot-marker" + index}
              />
            ))}
          </>
        )}
      </MapView>
      <ImageBackground
        source={require("../assets/searchBarBackground.png")}
        style={styles.searchBarContainer}
        imageStyle={styles.searchBarBackgroundImg}
      >
        <TextInput
          style={styles.searchBarTextInput}
          placeholder="where do you wanna go?"
          placeholderTextColor={colors.white}
          value={searchText}
          onChangeText={(newSearchText) => {
            setSearchText(newSearchText);
          }}
          onSubmitEditing={(e) => {
            setLocationSelected(false)
            setLocations([]);
            setParkingLots([]);
            searchLocationMarkers(searchText).then((locations) => {
              setLocations(locations);
            });
          }}
        />
      </ImageBackground>

      {locationSelected && <></>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // position
    position: "relative",

    // size
    width: "100%",
    height: "100%",
  },
  mapView: {
    // size
    width: "100%",
    height: "100%",
  },

  searchBarContainer: {
    position: "absolute",
    top: 50,
    left: "15%",

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

const customMapStyle = [
  {
    featureType: "all",
    elementType: "geometry",
    stylers: [
      {
        color: "#ebe3cd",
      },
    ],
  },
  {
    featureType: "all",
    elementType: "labels",
    stylers: [
      {
        visibility: "on",
      },
    ],
  },
  {
    featureType: "all",
    elementType: "labels.text",
    stylers: [
      {
        visibility: "on",
      },
    ],
  },
  {
    featureType: "all",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#523735",
      },
    ],
  },
  {
    featureType: "all",
    elementType: "labels.text.stroke",
    stylers: [
      {
        color: "#f5f1e6",
      },
    ],
  },
  {
    featureType: "administrative",
    elementType: "geometry",
    stylers: [
      {
        visibility: "off",
      },
    ],
  },
  {
    featureType: "administrative",
    elementType: "geometry.stroke",
    stylers: [
      {
        color: "#c9b2a6",
      },
    ],
  },
  {
    featureType: "administrative",
    elementType: "labels",
    stylers: [
      {
        visibility: "on",
      },
    ],
  },
  {
    featureType: "administrative.country",
    elementType: "labels",
    stylers: [
      {
        visibility: "on",
      },
    ],
  },
  {
    featureType: "administrative.province",
    elementType: "labels",
    stylers: [
      {
        visibility: "on",
      },
    ],
  },
  {
    featureType: "administrative.locality",
    elementType: "labels",
    stylers: [
      {
        visibility: "on",
      },
    ],
  },
  {
    featureType: "administrative.neighborhood",
    elementType: "all",
    stylers: [
      {
        visibility: "off",
      },
    ],
  },
  {
    featureType: "administrative.neighborhood",
    elementType: "labels",
    stylers: [
      {
        visibility: "on",
      },
    ],
  },
  {
    featureType: "administrative.land_parcel",
    elementType: "geometry.stroke",
    stylers: [
      {
        color: "#dcd2be",
      },
    ],
  },
  {
    featureType: "administrative.land_parcel",
    elementType: "labels",
    stylers: [
      {
        visibility: "on",
      },
    ],
  },
  {
    featureType: "administrative.land_parcel",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#ae9e90",
      },
    ],
  },
  {
    featureType: "landscape",
    elementType: "labels",
    stylers: [
      {
        visibility: "on",
      },
    ],
  },
  {
    featureType: "landscape.natural",
    elementType: "geometry",
    stylers: [
      {
        color: "#dfd2ae",
      },
    ],
  },
  {
    featureType: "poi",
    elementType: "all",
    stylers: [
      {
        visibility: "off",
      },
    ],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [
      {
        color: "#dfd2ae",
      },
    ],
  },
  {
    featureType: "poi",
    elementType: "labels",
    stylers: [
      {
        visibility: "on",
      },
    ],
  },
  {
    featureType: "poi",
    elementType: "labels.text",
    stylers: [
      {
        visibility: "off",
      },
    ],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#93817c",
      },
    ],
  },
  {
    featureType: "poi.park",
    elementType: "geometry.fill",
    stylers: [
      {
        color: "#a5b076",
      },
    ],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#447530",
      },
    ],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [
      {
        color: "#f5f1e6",
      },
    ],
  },
  {
    featureType: "road",
    elementType: "labels",
    stylers: [
      {
        visibility: "on",
      },
    ],
  },
  {
    featureType: "road",
    elementType: "labels.icon",
    stylers: [
      {
        visibility: "off",
      },
    ],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [
      {
        color: "#f8c967",
      },
    ],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [
      {
        color: "#e9bc62",
      },
    ],
  },
  {
    featureType: "road.highway.controlled_access",
    elementType: "geometry",
    stylers: [
      {
        color: "#e98d58",
      },
    ],
  },
  {
    featureType: "road.highway.controlled_access",
    elementType: "geometry.stroke",
    stylers: [
      {
        color: "#db8555",
      },
    ],
  },
  {
    featureType: "road.arterial",
    elementType: "geometry",
    stylers: [
      {
        color: "#fdfcf8",
      },
    ],
  },
  {
    featureType: "road.local",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#806b63",
      },
    ],
  },
  {
    featureType: "transit",
    elementType: "all",
    stylers: [
      {
        visibility: "off",
      },
    ],
  },
  {
    featureType: "transit",
    elementType: "labels",
    stylers: [
      {
        visibility: "on",
      },
    ],
  },
  {
    featureType: "transit.line",
    elementType: "geometry",
    stylers: [
      {
        color: "#dfd2ae",
      },
    ],
  },
  {
    featureType: "transit.line",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#8f7d77",
      },
    ],
  },
  {
    featureType: "transit.line",
    elementType: "labels.text.stroke",
    stylers: [
      {
        color: "#ebe3cd",
      },
    ],
  },
  {
    featureType: "transit.station",
    elementType: "geometry",
    stylers: [
      {
        color: "#dfd2ae",
      },
    ],
  },
  {
    featureType: "water",
    elementType: "geometry.fill",
    stylers: [
      {
        color: "#b9d3c2",
      },
    ],
  },
  {
    featureType: "water",
    elementType: "labels.text",
    stylers: [
      {
        visibility: "off",
      },
    ],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#92998d",
      },
    ],
  },
];
