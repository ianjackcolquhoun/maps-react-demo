import { StyleSheet } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedMapView } from '@/components/themed-map-view';
import { CartMarker } from '@/components/cart-marker';
import { StadiumMarker } from '@/components/stadium-marker';
import { CARTS, STADIUM } from '@/constants/carts';

export default function HomeScreen() {
  // Initial region - Downtown Cincinnati
  const initialRegion = {
    latitude: 39.1031,
    longitude: -84.512,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

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
