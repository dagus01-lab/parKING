import React, { useEffect, useState } from "react";
import { Text, StyleSheet, View, ImageBackground, Modal, Dimensions } from "react-native";
import MapView, {
  Marker,
  Circle,
  PROVIDER_GOOGLE,
  Callout,
} from "react-native-maps";
import {
  FlatList,
  Pressable,
  ScrollView,
  TextInput,
} from "react-native-gesture-handler";
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
  const [selectedParkingLot, setSelectedParkingLot] = useState<ParkingLot>();
  const [isLocationSelected, setIsLocationSelected] = useState<boolean>(false);
  const [isParkingSelected, setIsParkingSelected] = useState<boolean>(true);

  useEffect(() => {
    searchLocationMarkers(searchText).then((locations) => {
      setLocations(locations);
    });
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
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
          setIsLocationSelected(false);
          setIsParkingSelected(false);
          setSelectedParkingLot(undefined);
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
              setIsLocationSelected(true);
              setBoundary(newBoundary);
              searchParkingLots(newBoundary, 10).then((parkingsLots) => {
                setParkingLots(parkingsLots);
              });
            }}
          />
        ))}
        {isLocationSelected && (
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
                onSelect={() => {
                  setSelectedParkingLot(pl);
                  setIsParkingSelected(true);
                }}
              />
            ))}
          </>
        )}
      </MapView>
      <TextInput
        style={styles.searchBar}
        placeholder="where do you wanna go?"
        placeholderTextColor={colors.darkBlue3}
        value={searchText}
        onChangeText={(newSearchText) => {
          setSearchText(newSearchText);
        }}
        onSubmitEditing={(e) => {
          setIsLocationSelected(false);
          setLocations([]);
          setParkingLots([]);
          searchLocationMarkers(searchText).then((locations) => {
            setLocations(locations);
          });
        }}
      />
      {isParkingSelected && (
        <View style={styles.parkingLotDetailContainer}>
          <View style={styles.detail}>
            <Text style={styles.label}>Parcheggio: </Text>
            <Text style={styles.value}>{selectedParkingLot?.name}</Text>
          </View>
          <View style={styles.detail}>
            <Text style={styles.label}>Posti Liberi: </Text>
            <Text style={styles.value}>
              {selectedParkingLot?.availableParkings}
            </Text>
          </View>
          <View style={styles.detail}>
            <Text style={styles.label}>Posti Totali: </Text>
            <Text style={styles.value}>
              {selectedParkingLot?.totalParkings}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // position
    position: "relative",

    // size
    flex: 1,
  },
  map: {
    // size
    width: "100%",
    height: "100%",
  },

  searchBar: {
    position: "absolute",
    top: 60,
    left: "15%",

    // colors
    backgroundColor: colors.lightYellow3,
    color: colors.darkBlue3,

    borderRadius: 20,
    borderColor: colors.lightOrange1,
    borderWidth: 4,
    // size
    width: "70%",
    height: 60,

    // text
    textAlign: "center",
    fontSize: 20,
    fontWeight: 900,
  },

  parkingLotDetailContainer: {
    position: "absolute",
    bottom: 30,
    left: (Dimensions.get("window").width-200)/2,

    width: 200,
    height: "auto",
    aspectRatio: 1,
    marginBottom: 50,
    borderRadius: 20,
    borderColor: colors.lightOrange1,
    borderWidth: 4,

    backgroundColor: colors.lightYellow3,

    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 20,
  },

  detail: {
    flexDirection: "column",
    margin: 5,
  },

  label: {
    color: colors.darkBlue3,
    fontWeight: "900",
    fontSize: 15,
  },
  value: {
    color: "black",
    fontWeight: "600",
    fontSize: 20,
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
