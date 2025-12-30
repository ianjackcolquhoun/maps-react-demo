import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, View } from 'react-native';
import { Marker } from 'react-native-maps';

export type StadiumMarkerProps = {
  name: string;
  latitude: number;
  longitude: number;
};

export function StadiumMarker({ name, latitude, longitude }: StadiumMarkerProps) {
  return (
    <Marker
      coordinate={{
        latitude,
        longitude,
      }}
      title={name}
      tracksViewChanges={false}
    >
      <View style={styles.markerContainer}>
        <MaterialIcons name="sports-baseball" size={28} color="#ef4444" />
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  markerContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ef4444',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
