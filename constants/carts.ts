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

// Service area boundary polygon for downtown Cincinnati
export const SERVICE_AREA_COORDINATES = [
  { latitude: 39.087184207591065, longitude: -84.51869432563144 },
  { latitude: 39.088568525895084, longitude: -84.51295921817994 },
  { latitude: 39.09124204525713, longitude: -84.49855367546303 },
  { latitude: 39.094210859858805, longitude: -84.49281847460088 },
  { latitude: 39.097869873918825, longitude: -84.4882301889014 },
  { latitude: 39.101628084682545, longitude: -84.48644478053633 },
  { latitude: 39.10686961187102, longitude: -84.48236882778457 },
  { latitude: 39.107168350512694, longitude: -84.49001239631811 },
  { latitude: 39.103606243980266, longitude: -84.49791552341914 },
  { latitude: 39.1063732610742, longitude: -84.50300839651248 },
  { latitude: 39.11819090098837, longitude: -84.4993029719065 },
  { latitude: 39.118390759936375, longitude: -84.50159045247447 },
  { latitude: 39.11700136991567, longitude: -84.50450564358165 },
  { latitude: 39.11572197103618, longitude: -84.50641085204794 },
  { latitude: 39.11582153925349, longitude: -84.50958609613129 },
  { latitude: 39.11886026704204, longitude: -84.50843025065834 },
  { latitude: 39.11994706864513, longitude: -84.51427021106275 },
  { latitude: 39.122207829063655, longitude: -84.51629661820152 },
  { latitude: 39.12230754690731, longitude: -84.51794735512611 },
  { latitude: 39.11969481393308, longitude: -84.52055448953064 },
  { latitude: 39.12067901511497, longitude: -84.52373027064776 },
  { latitude: 39.11803234705846, longitude: -84.5223640104097 },
  { latitude: 39.1077574632933, longitude: -84.51969579536427 },
  { latitude: 39.10765913017838, longitude: -84.52148208568308 },
  { latitude: 39.10370493456995, longitude: -84.52096836431508 },
  { latitude: 39.107760150629616, longitude: -84.53755365014761 },
  { latitude: 39.10271615444725, longitude: -84.53666648301301 },
  { latitude: 39.10063934649253, longitude: -84.53117892427926 },
  { latitude: 39.09806732166379, longitude: -84.52914345499913 },
  { latitude: 39.094800562344176, longitude: -84.52341629338783 },
  { latitude: 39.087184207591065, longitude: -84.51869432563144 }, // Closing point
];
