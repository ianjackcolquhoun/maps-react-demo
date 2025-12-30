export interface Cart {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

export const CARTS: Cart[] = [
  {
    id: 'cart-1',
    name: 'Findlay Market Cart',
    latitude: 39.1116,
    longitude: -84.5158,
  },
  {
    id: 'cart-2',
    name: 'Fountain Square Cart',
    latitude: 39.1020,
    longitude: -84.5120,
  },
  {
    id: 'cart-3',
    name: 'Washington Park Cart',
    latitude: 39.1088,
    longitude: -84.5180,
  },
];

export const STADIUM = {
  name: 'Great American Ball Park',
  latitude: 39.0978,
  longitude: -84.5086,
};
