import { useEffect, useState } from 'react';
import { StyleSheet, Alert } from 'react-native';
import * as Location from 'expo-location';
import { Polygon } from 'react-native-maps';
import { ThemedView } from '@/components/themed-view';
import { ThemedMapView } from '@/components/themed-map-view';
import { CartMarker } from '@/components/cart-marker';
import { StadiumMarker } from '@/components/stadium-marker';
import { CARTS, STADIUM, SERVICE_AREA_COORDINATES } from '@/constants/carts';

export default function HomeScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);

  // Initial region - Downtown Cincinnati
  const initialRegion = {
    latitude: location?.coords.latitude ?? 39.1031,
    longitude: location?.coords.longitude ?? -84.512,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission',
          'Permission to access location was denied. Please enable it in settings to see your location on the map.'
        );
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    })();
  }, []);

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
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});
