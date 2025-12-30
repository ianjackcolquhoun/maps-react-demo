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

// Haversine formula to calculate distance between two coordinates in meters
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000 // Earth's radius in meters
  const lat1Rad = (lat1 * Math.PI) / 180
  const lat2Rad = (lat2 * Math.PI) / 180
  const latDiff = ((lat2 - lat1) * Math.PI) / 180
  const lonDiff = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(latDiff / 2) * Math.sin(latDiff / 2) +
    Math.cos(lat1Rad) *
      Math.cos(lat2Rad) *
      Math.sin(lonDiff / 2) *
      Math.sin(lonDiff / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // Distance in meters
}

interface RouteData {
  distance: string
  duration: string
  polyline: string
}

export default function HomeScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null)
  const [route, setRoute] = useState<RouteData | null>(null)

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

  const findNearestCart = () => {
    if (!location) {
      Alert.alert("Location Required", "Waiting for your location...")
      return null
    }

    const userLat = location.coords.latitude
    const userLon = location.coords.longitude

    let nearestCart = null
    let minDistance = Infinity

    CARTS.forEach((cart) => {
      const distance = calculateDistance(
        userLat,
        userLon,
        cart.latitude,
        cart.longitude
      )

      if (distance < minDistance) {
        minDistance = distance
        nearestCart = cart
      }
    })

    return { cart: nearestCart, distance: minDistance }
  }

  const fetchRoute = async (
    cartLat: number,
    cartLng: number,
    userLat: number,
    userLng: number,
    stadiumLat: number,
    stadiumLng: number
  ): Promise<RouteData | null> => {
    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      Alert.alert("Error", "Google Maps API key not found")
      return null
    }

    const origin = `${cartLat},${cartLng}`
    const destination = `${stadiumLat},${stadiumLng}`
    const waypoint = `${userLat},${userLng}`

    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&waypoints=${waypoint}&key=${apiKey}`

    try {
      const response = await fetch(url)
      const data = await response.json()

      if (data.status !== "OK") {
        Alert.alert("Route Error", `Failed to fetch route: ${data.status}`)
        return null
      }

      const route = data.routes[0]
      const leg = route.legs[0]

      return {
        distance: leg.distance.text,
        duration: leg.duration.text,
        polyline: route.overview_polyline.points,
      }
    } catch (error) {
      Alert.alert("Network Error", "Failed to fetch route from Google Maps")
      console.error("Directions API error:", error)
      return null
    }
  }

  const handleRequestPickup = async () => {
    const result = findNearestCart()

    if (!result || !result.cart || !location) {
      return
    }

    const distanceInMiles = (result.distance * 0.000621371).toFixed(2)
    console.log(`Nearest cart: ${result.cart.name}`)
    console.log(
      `Distance: ${distanceInMiles} miles (${result.distance.toFixed(0)} meters)`
    )

    // Fetch the route from cart → user → stadium
    const routeData = await fetchRoute(
      result.cart.latitude,
      result.cart.longitude,
      location.coords.latitude,
      location.coords.longitude,
      STADIUM.latitude,
      STADIUM.longitude
    )

    if (routeData) {
      setRoute(routeData)

      Alert.alert(
        "Route Found",
        `Cart: ${result.cart.name}\nDirect Distance: ${distanceInMiles} miles\n\nRoute Distance: ${routeData.distance}\nEstimated Time: ${routeData.duration}`
      )
    }
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
