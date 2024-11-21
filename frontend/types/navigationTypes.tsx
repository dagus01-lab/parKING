import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

export type RootStackParamList = {
  home: undefined;
  map: { searchText: string };
};

export type DetailsScreenNavigationProp = StackNavigationProp<RootStackParamList,"map">;
export type MapScreenRouteProps = RouteProp<RootStackParamList, "map">;

export type LocationMarker = {
  coordinates: { latitude: number; longitude: number };
  title: string;
  color: string;
};