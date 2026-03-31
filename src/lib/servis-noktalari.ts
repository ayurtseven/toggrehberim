export interface ServisNoktasi {
  id: string;
  il: string;
  ilce: string;
  adres: string;
  telefon: string;
  email: string;
  koordinat: { lat: string; lon: string };
  yakinZamanda: boolean;
}

/** Google Maps yönlendirme URL'i */
export function googleMapsUrl(lat: string, lon: string): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
}
