import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

export type RootStackParamList = {
  home: undefined;
  map: { searchText: string };
};

export type DetailsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "map"
>;
export type MapScreenRouteProps = RouteProp<RootStackParamList, "map">;
