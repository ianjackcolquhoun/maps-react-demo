import { StyleSheet } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedMapView } from '@/components/themed-map-view';

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
      <ThemedMapView style={styles.map} initialRegion={initialRegion} />
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
