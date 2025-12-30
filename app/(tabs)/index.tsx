import { CartMarker } from "@/components/cart-marker"
import { StadiumMarker } from "@/components/stadium-marker"
import { ThemedMapView } from "@/components/themed-map-view"
import { ThemedView } from "@/components/themed-view"
import { CARTS, SERVICE_AREA_COORDINATES, STADIUM } from "@/constants/carts"
import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import * as Location from "expo-location"
import { useEffect, useState } from "react"
import { Alert, StyleSheet, Text, TouchableOpacity } from "react-native"
import { Polygon } from "react-native-maps"

export default function HomeScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null)

  // Initial region - Downtown Cincinnati
  const initialRegion = {
    latitude: location?.coords.latitude ?? 39.1031,
    longitude: location?.coords.longitude ?? -84.512,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  }

  useEffect(() => {
    ;(async () => {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        Alert.alert(
          "Location Permission",
          "Permission to access location was denied. Please enable it in settings to see your location on the map."
        )
        return
      }

      const currentLocation = await Location.getCurrentPositionAsync({})
      setLocation(currentLocation)
    })()
  }, [])

  const handleRequestPickup = () => {
    // TODO: Implement ride request logic
    console.log("Request pickup button pressed")
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedMapView style={styles.map} initialRegion={initialRegion}>
        <Polygon
          coordinates={SERVICE_AREA_COORDINATES}
          fillColor="rgba(171, 71, 188, 0.1)"
          strokeColor="#9C27B0"
          strokeWidth={2}
        />
        {CARTS.map((cart) => (
          <CartMarker key={cart.id} cart={cart} />
        ))}
        <StadiumMarker
          name={STADIUM.name}
          latitude={STADIUM.latitude}
          longitude={STADIUM.longitude}
        />
      </ThemedMapView>

      <TouchableOpacity
        style={styles.requestButton}
        onPress={handleRequestPickup}
        activeOpacity={0.8}
      >
        <MaterialIcons name="sports-baseball" size={24} color="#ffffff" />
        <Text style={styles.requestButtonText}>Request Pickup to Stadium</Text>
      </TouchableOpacity>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  requestButton: {
    position: "absolute",
    bottom: 50,
    alignSelf: "center",
    backgroundColor: "#7c3aed",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },
  requestButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
})
