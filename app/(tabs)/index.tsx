import { useEffect, useState } from 'react';
import { StyleSheet, Alert } from 'react-native';
import * as Location from 'expo-location';
import { ThemedView } from '@/components/themed-view';
import { ThemedMapView } from '@/components/themed-map-view';
import { CartMarker } from '@/components/cart-marker';
import { StadiumMarker } from '@/components/stadium-marker';
import { CARTS, STADIUM } from '@/constants/carts';

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
