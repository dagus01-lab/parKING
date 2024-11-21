import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { TextInput } from "react-native-gesture-handler";
import zone from "../data/zone";
import colors from "../data/colors";
import apis from "../apis/apis";
import { MapScreenRouteProps, LocationMarker } from "../types/navigationTypes";
import { APIParameter } from "../types/apiTypes";

export default function MapScreen(props: { route: MapScreenRouteProps }) {
  const [searchText, setSearchText] = useState<string>(
    props.route.params.searchText
  );
  const [locationMarkers, setLocationMarkers] = useState<LocationMarker[]>([]);

  const loadLocationMarkers = () => {
    const apiParameters = [
      new APIParameter("text", searchText),
      new APIParameter("boundary.circle.lat", zone.centerLatitude.toString()),
      new APIParameter("boundary.circle.lon", zone.centerLongitude.toString()),
      new APIParameter("boundary.circle.radius", zone.radius.toString()),
    ];
    apis["geocode/search"].fetch(apiParameters)?.then((res) => {
      res.json().then((json) => {
        const markers = json.features.map(
          (f: {
            geometry: { coordinates: number[] };
            properties: { name: string };
          }) => {
            return {
              coordinates: {
                latitude: f.geometry.coordinates[1],
                longitude: f.geometry.coordinates[0],
              },
              title: f.properties.name,
            };
          }
        );
        setLocationMarkers(markers);
      });
    });
  };

  useEffect(loadLocationMarkers, []);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.mapView}
        customMapStyle={customMapStyle}
        initialRegion={{
          latitude: zone.centerLatitude,
          longitude: zone.centerLongitude,
          latitudeDelta: 1,
          longitudeDelta: 1,
        }}
      >
        {locationMarkers.map((lm, index) => (
          <Marker
            title={lm.title}
            coordinate={lm.coordinates}
            key={"marker-" + index}
          />
        ))}
      </MapView>
      <TextInput
        style={styles.searchBar}
        placeholder="where do you wanna go?"
        placeholderTextColor={colors.baseColor}
        value={searchText}
        onChangeText={(newText) => {
          setSearchText(newText);
        }}
        onSubmitEditing={(e) => {
          loadLocationMarkers();
        }}
      />
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
  searchBar: {
    // position
    position: "absolute",
    top: 50,
    left: "10%",

    // colors
    backgroundColor: colors.contrastColor,
    color: colors.baseColor,

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
  text: {
    // colors
    color: colors.textColor,
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
