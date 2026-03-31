export interface ServisNoktasi {
  id: string;
  il: string;
  ilce: string;
  adres: string;
  /** Geriye dönük uyumluluk — JSON dosyasında tek telefon */
  telefon: string;
  email: string;
  koordinat: { lat: string; lon: string };
  yakinZamanda: boolean;
  /** Supabase'den eklenen çoklu telefonlar */
  telefonlar?: string[];
  /** Supabase'den eklenen özel Maps linki (boşsa otomatik oluşturulur) */
  maps_url?: string;
}

/** Google Maps yönlendirme URL'i */
export function googleMapsUrl(lat: string, lon: string): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
}
