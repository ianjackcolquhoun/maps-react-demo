import { CartMarker } from "@/components/cart-marker"
import { StadiumMarker } from "@/components/stadium-marker"
import { ThemedMapView } from "@/components/themed-map-view"
import { ThemedView } from "@/components/themed-view"
import { CARTS, SERVICE_AREA_COORDINATES, STADIUM } from "@/constants/carts"
import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import * as Location from "expo-location"
import { useEffect, useRef, useState } from "react"
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { Polygon, Polyline } from "react-native-maps"

// Decode Google's encoded polyline format
function decodePolyline(encoded: string): { latitude: number; longitude: number }[] {
  const poly = []
  let index = 0
  const len = encoded.length
  let lat = 0
  let lng = 0

  while (index < len) {
    let b
    let shift = 0
    let result = 0

    do {
      b = encoded.charCodeAt(index++) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (b >= 0x20)

    const deltaLat = result & 1 ? ~(result >> 1) : result >> 1
    lat += deltaLat

    shift = 0
    result = 0

    do {
      b = encoded.charCodeAt(index++) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (b >= 0x20)

    const deltaLng = result & 1 ? ~(result >> 1) : result >> 1
    lng += deltaLng

    poly.push({
      latitude: lat / 1e5,
      longitude: lng / 1e5,
    })
  }

  return poly
}

// Interpolate position along route coordinates based on progress (0 to 1)
function interpolateRoute(
  coordinates: { latitude: number; longitude: number }[],
  progress: number
): { latitude: number; longitude: number } {
  if (coordinates.length === 0) {
    return { latitude: 0, longitude: 0 }
  }

  if (progress <= 0) return coordinates[0]
  if (progress >= 1) return coordinates[coordinates.length - 1]

  const totalSegments = coordinates.length - 1
  const targetIndex = progress * totalSegments
  const lowerIndex = Math.floor(targetIndex)
  const upperIndex = Math.min(lowerIndex + 1, coordinates.length - 1)
  const segmentProgress = targetIndex - lowerIndex

  const lower = coordinates[lowerIndex]
  const upper = coordinates[upperIndex]

  return {
    latitude: lower.latitude + (upper.latitude - lower.latitude) * segmentProgress,
    longitude: lower.longitude + (upper.longitude - lower.longitude) * segmentProgress,
  }
}

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

interface RouteLeg {
  distance: string
  duration: string
  polyline: string
  coordinates: { latitude: number; longitude: number }[]
}

interface RouteData {
  legToUser: RouteLeg
  legToStadium: RouteLeg
}

type RideStatus = "idle" | "requesting" | "enroute" | "pickup" | "riding" | "completed"

export default function HomeScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null)
  const [route, setRoute] = useState<RouteData | null>(null)
  const [rideStatus, setRideStatus] = useState<RideStatus>("idle")
  const [selectedCart, setSelectedCart] = useState<Cart | null>(null)
  const [animatedCartPosition, setAnimatedCartPosition] = useState<{
    latitude: number
    longitude: number
  } | null>(null)
  const animationInterval = useRef<NodeJS.Timeout | null>(null)
  const pauseTimeout = useRef<NodeJS.Timeout | null>(null)

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

  // Animate cart movement
  useEffect(() => {
    // Animation to user
    if (rideStatus === "enroute" && route && selectedCart && location) {
      const animationDuration = 15 // 15 seconds to reach user
      const updateInterval = 100
      const totalSteps = (animationDuration * 1000) / updateInterval
      let currentStep = 0

      console.log("Starting animation to user")

      setAnimatedCartPosition({
        latitude: selectedCart.latitude,
        longitude: selectedCart.longitude,
      })

      animationInterval.current = setInterval(() => {
        currentStep++
        const progress = currentStep / totalSteps

        if (currentStep % 50 === 0) {
          console.log(`Animation to user: ${(progress * 100).toFixed(1)}%`)
        }

        if (progress >= 1) {
          if (animationInterval.current) {
            clearInterval(animationInterval.current)
          }

          console.log("Cart reached user, pausing for 2 seconds")

          // Set position to user location
          setAnimatedCartPosition({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          })

          // Pause for 2 seconds, then transition to pickup
          pauseTimeout.current = setTimeout(() => {
            console.log("Starting route to stadium")
            setRideStatus("pickup")
          }, 2000)
        } else {
          const newPosition = interpolateRoute(route.legToUser.coordinates, progress)
          setAnimatedCartPosition(newPosition)
        }
      }, updateInterval)
    }
    // Animation to stadium
    else if (rideStatus === "pickup" && route && location) {
      const animationDuration = 20 // 20 seconds to reach stadium
      const updateInterval = 100
      const totalSteps = (animationDuration * 1000) / updateInterval
      let currentStep = 0

      console.log("Starting animation to stadium")

      setAnimatedCartPosition({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      })

      animationInterval.current = setInterval(() => {
        currentStep++
        const progress = currentStep / totalSteps

        if (currentStep % 50 === 0) {
          console.log(`Animation to stadium: ${(progress * 100).toFixed(1)}%`)
        }

        if (progress >= 1) {
          if (animationInterval.current) {
            clearInterval(animationInterval.current)
          }

          console.log("Arrived at stadium!")

          setAnimatedCartPosition(null)
          setRideStatus("completed")

          // Show completion message
          Alert.alert(
            "Ride Complete!",
            "You've arrived at Great American Ball Park. Enjoy the game!",
            [
              {
                text: "OK",
                onPress: () => {
                  setRoute(null)
                  setRideStatus("idle")
                  setSelectedCart(null)
                },
              },
            ]
          )
        } else {
          const newPosition = interpolateRoute(route.legToStadium.coordinates, progress)
          setAnimatedCartPosition(newPosition)
        }
      }, updateInterval)
    } else {
      // Clear animations if status changes
      if (animationInterval.current) {
        clearInterval(animationInterval.current)
      }
      if (pauseTimeout.current) {
        clearTimeout(pauseTimeout.current)
      }
      if (rideStatus === "idle") {
        setAnimatedCartPosition(null)
      }
    }

    // Cleanup
    return () => {
      if (animationInterval.current) {
        clearInterval(animationInterval.current)
      }
      if (pauseTimeout.current) {
        clearTimeout(pauseTimeout.current)
      }
    }
  }, [rideStatus, route, selectedCart, location])

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

      // Route has 2 legs: cart → user, user → stadium
      const legToUser = route.legs[0]
      const legToStadium = route.legs[1]

      // Decode and combine coordinates from all steps in each leg
      const legToUserCoords = legToUser.steps.flatMap((step: any) =>
        decodePolyline(step.polyline.points)
      )
      const legToStadiumCoords = legToStadium.steps.flatMap((step: any) =>
        decodePolyline(step.polyline.points)
      )

      console.log("Leg to user:", legToUserCoords.length, "coordinates")
      console.log("Leg to stadium:", legToStadiumCoords.length, "coordinates")

      return {
        legToUser: {
          distance: legToUser.distance.text,
          duration: legToUser.duration.text,
          polyline: "", // Not needed anymore
          coordinates: legToUserCoords,
        },
        legToStadium: {
          distance: legToStadium.distance.text,
          duration: legToStadium.duration.text,
          polyline: "", // Not needed anymore
          coordinates: legToStadiumCoords,
        },
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

    // Set status to requesting and store selected cart
    setRideStatus("requesting")
    setSelectedCart(result.cart)

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
      setRideStatus("enroute")
    } else {
      // Reset to idle if route fetch failed
      setRideStatus("idle")
      setSelectedCart(null)
    }
  }

  const handleCancelRequest = () => {
    setRoute(null)
    setRideStatus("idle")
    setSelectedCart(null)
  }

  // Button content based on ride status
  const getButtonContent = () => {
    switch (rideStatus) {
      case "idle":
        return {
          text: "Request Pickup to Stadium",
          icon: "sports-baseball" as const,
          onPress: handleRequestPickup,
          disabled: false,
        }
      case "requesting":
        return {
          text: "Finding Route...",
          icon: "hourglass-empty" as const,
          onPress: () => {},
          disabled: true,
        }
      case "enroute":
        return {
          text: "Cancel Request",
          icon: "close" as const,
          onPress: handleCancelRequest,
          disabled: false,
        }
      case "pickup":
        return {
          text: "Ride in Progress",
          icon: "sports-baseball" as const,
          onPress: () => {},
          disabled: true,
        }
      default:
        return {
          text: "Request Pickup to Stadium",
          icon: "sports-baseball" as const,
          onPress: handleRequestPickup,
          disabled: false,
        }
    }
  }

  const buttonContent = getButtonContent()

  // Ride info card content based on status
  const getRideInfoContent = () => {
    if (!selectedCart || !route) return null

    switch (rideStatus) {
      case "requesting":
        return {
          status: "Finding best route...",
          cart: selectedCart.name,
          showETA: false,
        }
      case "enroute":
        return {
          status: "Cart is on the way",
          cart: selectedCart.name,
          eta: route.legToUser.duration,
          distance: route.legToUser.distance,
          showETA: true,
        }
      case "pickup":
        return {
          status: "En route to stadium",
          cart: `${selectedCart.name} → ${STADIUM.name}`,
          eta: route.legToStadium.duration,
          distance: route.legToStadium.distance,
          showETA: true,
        }
      default:
        return null
    }
  }

  const rideInfo = getRideInfoContent()

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
          <CartMarker
            key={cart.id}
            cart={cart}
            coordinate={
              cart.id === selectedCart?.id && animatedCartPosition
                ? animatedCartPosition
                : undefined
            }
          />
        ))}
        <StadiumMarker
          name={STADIUM.name}
          latitude={STADIUM.latitude}
          longitude={STADIUM.longitude}
        />
        {route && rideStatus === "enroute" && (
          <Polyline
            coordinates={route.legToUser.coordinates}
            strokeColor="#7c3aed"
            strokeWidth={4}
          />
        )}
        {route && rideStatus === "pickup" && (
          <>
            <Polyline
              coordinates={route.legToUser.coordinates}
              strokeColor="#9ca3af"
              strokeWidth={3}
            />
            <Polyline
              coordinates={route.legToStadium.coordinates}
              strokeColor="#7c3aed"
              strokeWidth={4}
            />
          </>
        )}
      </ThemedMapView>

      {rideInfo && (
        <View style={styles.rideInfoCard}>
          <View style={styles.rideInfoHeader}>
            <MaterialIcons name="directions-car" size={20} color="#7c3aed" />
            <Text style={styles.rideInfoStatus}>{rideInfo.status}</Text>
          </View>
          <Text style={styles.rideInfoCart}>{rideInfo.cart}</Text>
          {rideInfo.showETA && (
            <View style={styles.rideInfoDetails}>
              <View style={styles.rideInfoDetailItem}>
                <MaterialIcons name="access-time" size={16} color="#6b7280" />
                <Text style={styles.rideInfoDetailText}>ETA: {rideInfo.eta}</Text>
              </View>
              <View style={styles.rideInfoDetailItem}>
                <MaterialIcons name="straighten" size={16} color="#6b7280" />
                <Text style={styles.rideInfoDetailText}>{rideInfo.distance}</Text>
              </View>
            </View>
          )}
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.requestButton,
          buttonContent.disabled && styles.requestButtonDisabled,
        ]}
        onPress={buttonContent.onPress}
        activeOpacity={0.8}
        disabled={buttonContent.disabled}
      >
        <MaterialIcons name={buttonContent.icon} size={24} color="#ffffff" />
        <Text style={styles.requestButtonText}>{buttonContent.text}</Text>
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
  requestButtonDisabled: {
    backgroundColor: "#9ca3af",
    opacity: 0.7,
  },
  rideInfoCard: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  rideInfoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  rideInfoStatus: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  rideInfoCart: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 12,
  },
  rideInfoDetails: {
    flexDirection: "row",
    gap: 16,
  },
  rideInfoDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  rideInfoDetailText: {
    fontSize: 13,
    color: "#6b7280",
  },
})
