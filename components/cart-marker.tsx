import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, View } from 'react-native';
import { Marker } from 'react-native-maps';
import type { Cart } from '@/constants/carts';

export type CartMarkerProps = {
  cart: Cart;
};

export function CartMarker({ cart }: CartMarkerProps) {
  return (
    <Marker
      coordinate={{
        latitude: cart.latitude,
        longitude: cart.longitude,
      }}
      title={cart.name}
      tracksViewChanges={false}
    >
      <View style={styles.markerContainer}>
        <MaterialIcons name="directions-car" size={24} color="#7c3aed" />
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#7c3aed',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
