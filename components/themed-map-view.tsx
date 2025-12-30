import { ThemedText } from "@/components/themed-text"
import { ThemedView } from "@/components/themed-view"
import { useColorScheme } from "@/hooks/use-color-scheme"
import { useState } from "react"
import { StyleSheet, type ViewProps } from "react-native"
import MapView, { PROVIDER_GOOGLE } from "react-native-maps"

export type ThemedMapViewProps = ViewProps & {
  initialRegion?: {
    latitude: number
    longitude: number
    latitudeDelta: number
    longitudeDelta: number
  }
  children?: React.ReactNode
}

export function ThemedMapView({
  style,
  initialRegion,
  children,
  ...otherProps
}: ThemedMapViewProps) {
  const colorScheme = useColorScheme()
  const [isLoading, setIsLoading] = useState(true)
  const [mapError, setMapError] = useState<string | null>(null)

  // Default to downtown Cincinnati if no initial region provided
  const defaultRegion = {
    latitude: 39.1031,
    longitude: -84.512,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  }

  const region = initialRegion || defaultRegion

  // Dark mode map style
  const darkMapStyle = [
    {
      featureType: "all",
      elementType: "geometry",
      stylers: [{ color: "#242424" }],
    },
    {
      featureType: "all",
      elementType: "labels.text.fill",
      stylers: [{ color: "#b0b0b0" }],
    },
    {
      featureType: "all",
      elementType: "labels.text.stroke",
      stylers: [{ color: "#1a1a1a" }, { lightness: -20 }],
    },
    {
      featureType: "poi",
      elementType: "all",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [{ color: "#1a2e1a" }, { visibility: "on" }],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#3a3a3a" }],
    },
    {
      featureType: "road",
      elementType: "geometry.stroke",
      stylers: [{ color: "#2a2a2a" }],
    },
    {
      featureType: "road.arterial",
      elementType: "labels",
      stylers: [{ visibility: "on" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#4a4a4a" }],
    },
    {
      featureType: "road.highway",
      elementType: "labels",
      stylers: [{ visibility: "on" }],
    },
    {
      featureType: "road.local",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "transit",
      elementType: "all",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#1e3a5f" }],
    },
    {
      featureType: "water",
      elementType: "labels.text",
      stylers: [{ visibility: "simplified" }],
    },
  ]

  if (mapError) {
    return (
      <ThemedView style={[styles.errorContainer, style]}>
        <ThemedText type="subtitle">Map Error</ThemedText>
        <ThemedText>{mapError}</ThemedText>
        <ThemedText style={styles.errorHint}>
          Please check your Google Maps API key configuration in app.json
        </ThemedText>
      </ThemedView>
    )
  }

  return (
    <>
      {isLoading && (
        <ThemedView style={[styles.loadingContainer, style]}>
          <ThemedText>Loading map...</ThemedText>
        </ThemedView>
      )}
      <MapView
        style={[styles.map, style]}
        initialRegion={region}
        provider={PROVIDER_GOOGLE}
        customMapStyle={darkMapStyle}
        showsUserLocation={true}
        showsMyLocationButton={true}
        onMapReady={() => setIsLoading(false)}
        onError={(e) => {
          setMapError(e.nativeEvent?.message || "Unknown map error")
          setIsLoading(false)
        }}
        {...otherProps}
      >
        {children}
      </MapView>
    </>
  )
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    gap: 12,
  },
  errorHint: {
    fontSize: 14,
    textAlign: "center",
    opacity: 0.7,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
})
