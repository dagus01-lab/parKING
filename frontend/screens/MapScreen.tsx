import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { TextInput } from "react-native-gesture-handler";
import zone from "../data/zone";
import colors from "../data/colors";
import APIs from "../apis/APIs.data";
import {
  Coordinate,
  Boundary,
  PointOfInterest,
  ParkingLot,
} from "../model/model.parKING.types";
import { APIParameter } from "../apis/api.types";
import { MapScreenRouteProps } from "./navigation.types";

export default function MapScreen(props: { route: MapScreenRouteProps }) {
  const [searchText, setSearchText] = useState<string>(
    props.route.params.searchText
  );
  const [locations, setLocations] = useState<PointOfInterest[]>([]);

  const [boundaryRadius, setBoundaryRadius] = useState<number>(1);
  const [parkingLots, setParkingLots] = useState<PointOfInterest[]>([]);

  const searchLocationMarkers = (searchText: string) => {
    const apiParameters = [
      new APIParameter("text", searchText),
      new APIParameter("boundary.circle.lat", zone.centerLatitude.toString()),
      new APIParameter("boundary.circle.lon", zone.centerLongitude.toString()),
      new APIParameter("boundary.circle.radius", zone.radius.toString()),
    ];
    APIs["geocode/search"].fetch(apiParameters)?.then((res) => {
      res.json().then((json) => {
        const markers: PointOfInterest[] = json.features.map(
          (f: {
            geometry: { coordinates: number[] };
            properties: { name: string };
          }) => {
            return {
              name: f.properties.name,
              coordinate: {
                latitude: f.geometry.coordinates[1],
                longitude: f.geometry.coordinates[0],
              },
            };
          }
        );
        setLocations(markers);
      });
    });
  };

  const searchParkingMarkers = (location: PointOfInterest, radius: number) => {
    const apiParameters = [
      new APIParameter(
        "boundary.center.latitude",
        location.coordinate.latitude.toString()
      ),
      new APIParameter(
        "boundary.center.longitude",
        location.coordinate.longitude.toString()
      ),
      new APIParameter("boundary.radius", boundaryRadius.toString()),
      new APIParameter("maxResults", "10"),
    ];
    APIs["parkingLots/search"].fetch(apiParameters)?.then((res) => {
      res.json().then((json) => {
        const markers = json.map((pl: ParkingLot) => {
          return {
            coordinate:pl.coordinate,
            name: pl.name,
          };
        });
        setParkingLots(markers);
      });
    });
  };

  const selectLocationMarker = (location: PointOfInterest) => {
    setLocations([location]);
    searchParkingMarkers(location, boundaryRadius);
  };

  useEffect(() => {
    searchLocationMarkers(searchText);
  }, []);

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
        {locations.map((lm, index) => (
          <Marker
            title={lm.name}
            coordinate={lm.coordinate}
            pinColor="red"
            key={"location-marker" + index}
            onSelect={() => {
              selectLocationMarker(lm);
            }}
          />
        ))}
        {parkingLots.map((pl, index) => (
          <Marker
            title={pl.name}
            coordinate={pl.coordinate}
            pinColor="blue"
            key={"parking-lot-marker" + index}
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
          searchLocationMarkers(searchText);
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
