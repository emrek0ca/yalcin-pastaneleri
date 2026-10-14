import { Branch } from '../types/index.js';

export const VERIFIED_BRANCHES: Branch[] = [
  {
    id: 'raufbey',
    name: 'Raufbey Şubesi (Merkez)',
    slug: 'raufbey',
    district: 'Raufbey Mahallesi',
    city: 'Osmaniye',
    address: 'Raufbey Mah. Atatürk Cd. No:308, Osmaniye Merkez',
    phone: '0544 648 60 40',
    coordinates: {
      lat: 37.0728,
      lng: 36.2483,
    },
    openingHours: '07:30 - 23:30',
    orderHours: '08:00 - 22:30',
    status: 'verified',
    sourceUrl: 'https://qrmenu.yalcinpastaneleri.com/',
    features: ['Pastane & Fırın', 'Geleneksel Tatlılar', 'Kahvaltı Tabağı', 'Paket Servis', 'Gel Al'],
    isDeliveryAvailable: true,
    isPickupAvailable: true,
    minimumOrderCents: 20000, // 200.00 TL
    deliveryFeeCents: 0,      // Ücretsiz teslimat (şube sınırları içinde)
  },
  {
    id: 'adnan-menderes',
    name: 'Adnan Menderes Şubesi (Kafe & Restoran)',
    slug: 'adnan-menderes',
    district: 'Adnan Menderes Mahallesi',
    city: 'Osmaniye',
    address: 'Adnan Menderes Mah. 19524. Sk. No:8, Osmaniye Merkez',
    phone: '0501 369 00 80',
    coordinates: {
      lat: 37.0851,
      lng: 36.2574,
    },
    openingHours: '08:00 - 00:00',
    orderHours: '08:30 - 23:00',
    status: 'verified',
    sourceUrl: 'https://qrmenu.yalcinpastaneleri.com/',
    features: ['Restoran & Dünya Mutfağı', 'Pizza & Burger', 'Et & Tavuk Yemekleri', 'Pastane & Kafe', 'Paket Servis', 'Gel Al'],
    isDeliveryAvailable: true,
    isPickupAvailable: true,
    minimumOrderCents: 25000, // 250.00 TL
    deliveryFeeCents: 0,
  },
];

export const BRAND_INFO = {
  name: 'Yalçın Pastaneleri',
  tagline: '1997’den beri Pastaneci Emine Abla — Yalçın Ailenizin Pastanesi',
  city: 'Osmaniye',
  instagram: 'https://www.instagram.com/yalcinpastaneleri/',
  qrMenuUrl: 'https://qrmenu.yalcinpastaneleri.com/',
  establishedYear: 1997,
  accentColor: '#B22222', // Authentic warm patisserie red / burgundy from logo
  primaryColor: '#1C1C1C',
  supportPhone: '0544 648 60 40',
};
