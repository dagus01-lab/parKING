import React, { useEffect, useState } from "react";
import { Text, StyleSheet, View } from "react-native";
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
              strokeColor={colors.blue}
              fillColor={colors.transparentBlue}
            />
            {parkingLots.map((pl, index) => (
              <Marker
                coordinate={pl.coordinate}
                title={pl.name}
                description={`posti :${pl.availableParkings}`}
                pinColor="blue"
                key={"parking-lot-marker" + index}
                calloutOffset={{ x: 100, y: 100 }}
              />
            ))}
          </>
        )}
      </MapView>
      <TextInput
        style={styles.searchLocationBar}
        placeholder="where do you wanna go?"
        placeholderTextColor={colors.yellow}
        value={searchText}
        onChangeText={(newText) => {
          setSearchText(newText);
        }}
        onSubmitEditing={(e) => {
          searchLocationMarkers(searchText).then((locations) => {
            setLocations(locations);
          });
        }}
      />
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
  searchLocationBar: {
    // position
    position: "absolute",
    top: 50,
    left: "10%",

    // colors
    backgroundColor: colors.red,
    color: colors.yellow,

    // size
    width: "80%",
    height: 60,

    // borders and spaces
    borderRadius: 20,
    padding: 20,

    // text
    textAlign: "center",
    fontSize: 20,
    fontWeight: 900,
  },
});

const customMapStyle = [
  {
    elementType: "labels.icon",
    stylers: [
      {
        visibility: "simplified",
      },
    ],
  },
  {
    featureType: "landscape.man_made",
    elementType: "geometry.fill",
    stylers: [
      {
        color: "#f1d788",
      },
    ],
  },
  {
    featureType: "landscape.natural",
    elementType: "geometry.fill",
    stylers: [
      {
        color: "#ceb773",
      },
    ],
  },
  {
    featureType: "poi",
    elementType: "geometry.fill",
    stylers: [
      {
        color: "#f18888",
      },
    ],
  },
  {
    featureType: "road",
    elementType: "geometry.fill",
    stylers: [
      {
        color: "#c8c832",
      },
    ],
  },
  {
    featureType: "transit",
    elementType: "geometry.fill",
    stylers: [
      {
        color: "#f18888",
      },
    ],
  },
];
