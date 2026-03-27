export interface Baglanti {
  tip: string;
  tipSinifi: "dc" | "ac";
  gucKW?: number;
  adet: number;
  durum: "acik" | "kapali" | "bilinmiyor";
}

export interface Istasyon {
  id: number;
  ad: string;
  adres: string;
  sehir: string;
  lat: number;
  lng: number;
  operator: string;
  operatorUrl?: string;
  operatorKey: string;
  baglantilar: Baglanti[];
  durum: "acik" | "kapali" | "bilinmiyor";
  sonGuncelleme: string;
  maxKW: number;
  hasDC: boolean;
}

export type Filtreler = {
  operator: string;
  tip: "tumu" | "dc" | "ac";
  sadecAktif: boolean;
};
