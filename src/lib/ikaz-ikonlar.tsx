// SVG ikaz sembol ikonları — Togg T10X / T10F dashboard uyarı lambaları
// Tümü 24×24 viewBox, stroke tabanlı, currentColor kullanır
import React from "react";

type P = { className?: string };

// ─── Kırmızı İkazlar ─────────────────────────────────────────────────────────

export function IkonBatarya({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="1" y="7" width="17" height="11" rx="2" />
      <path d="M18 10.5h3v4h-3" />
      <line x1="9.5" y1="10" x2="9.5" y2="14" />
      <circle cx="9.5" cy="15.2" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IkonFren({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Fren diski — dış halka + iç disk */}
      <circle cx="12" cy="12" r="9.5" />
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="7.5" x2="12" y2="12.5" />
      <circle cx="12" cy="14" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IkonHavaYastigi({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* SRS — oturan kişi + hava yastığı balonu */}
      <circle cx="17" cy="5" r="2.2" />
      <line x1="17" y1="7.2" x2="17" y2="13" />
      <line x1="17" y1="11" x2="14" y2="16" />
      <circle cx="9.5" cy="13" r="5.5" />
    </svg>
  );
}

export function IkonMotor({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Dişli çark — 4 diş + merkez */}
      <circle cx="12" cy="12" r="3.5" />
      <rect x="9.5" y="1" width="5" height="4" rx="1.2" />
      <rect x="9.5" y="19" width="5" height="4" rx="1.2" />
      <rect x="1" y="9.5" width="4" height="5" rx="1.2" />
      <rect x="19" y="9.5" width="4" height="5" rx="1.2" />
      <line x1="12" y1="5" x2="12" y2="8.5" />
      <line x1="12" y1="15.5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="8.5" y2="12" />
      <line x1="15.5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export function IkonYuksekVoltaj({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Yıldırım şimşeği */}
      <polygon points="13,2 4,14 12,14 11,22 20,10 12,10" />
    </svg>
  );
}

export function IkonDireksiyon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Direksiyon çarkı */}
      <circle cx="12" cy="12" r="9.5" />
      <circle cx="12" cy="12" r="3" />
      <line x1="12" y1="2.5" x2="12" y2="9" />
      <line x1="4" y1="16.5" x2="9" y2="13.5" />
      <line x1="20" y1="16.5" x2="15" y2="13.5" />
    </svg>
  );
}

export function IkonParkFren({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="9.5" />
      <text x="12" y="17" fontSize="12" fontWeight="bold" fontFamily="system-ui,sans-serif" textAnchor="middle" fill="currentColor" stroke="none">P</text>
    </svg>
  );
}

// Emniyet kemeri — oturan insan + çapraz kemer çizgisi
export function IkonEmniyetKemeri({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Koltuk arka yayı */}
      <path d="M5 22 V8 Q5 4 9 4 h6 Q19 4 19 8 V22" />
      {/* Oturan insan kafası */}
      <circle cx="12" cy="6.5" r="2" />
      {/* Gövde */}
      <line x1="12" y1="8.5" x2="12" y2="14" />
      {/* Emniyet kemeri — sol omuzdan sağ bele çapraz */}
      <line x1="8" y1="9" x2="15" y2="16" strokeWidth="2" />
      {/* Kemer alt tokası */}
      <line x1="8" y1="16" x2="15" y2="16" />
    </svg>
  );
}

// 12V Akü — üstte terminal çıkıntıları olan dikdörtgen
export function IkonAku({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Akü gövdesi */}
      <rect x="3" y="8" width="18" height="13" rx="1.5" />
      {/* Sol terminal (+) */}
      <rect x="6" y="5" width="4" height="4" rx="0.8" />
      {/* Sağ terminal (-) */}
      <rect x="14" y="5" width="4" height="4" rx="0.8" />
      {/* Artı işareti */}
      <line x1="7.5" y1="13" x2="10.5" y2="13" />
      <line x1="9" y1="11.5" x2="9" y2="14.5" />
      {/* Eksi işareti */}
      <line x1="13.5" y1="13" x2="16.5" y2="13" />
    </svg>
  );
}

// Termal sistem — ısı bloğu + ısı dalgaları
export function IkonTermal({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Motor/termal blok */}
      <rect x="3" y="10" width="14" height="10" rx="1.5" />
      {/* Üst boru bağlantıları */}
      <line x1="6" y1="10" x2="6" y2="7" />
      <line x1="10" y1="10" x2="10" y2="7" />
      <line x1="14" y1="10" x2="14" y2="7" />
      {/* Isı dalgaları sağda */}
      <path d="M19 11 q1.5-1.5 0-3" />
      <path d="M21 10 q2-2.5 0-5" />
    </svg>
  );
}

// Yangın — alev simgesi
export function IkonYangin({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Uyarı üçgeni */}
      <path d="M12 3 L22 20 H2 Z" />
      {/* Alev içeride */}
      <path d="M12 17 c-2 0-3-1.5-2-3.5 0.5-1 1-1.5 0.5-2.5 1 0.5 1.5 2 1 3 0.5-0.5 1-2.5 2-2 0.5 1.5 0 4-1.5 5z" fill="currentColor" stroke="none" />
    </svg>
  );
}

// eCall / SOS
export function IkonEcall({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="6" width="20" height="13" rx="3" />
      <text x="12" y="16.5" fontSize="7.5" fontWeight="bold" fontFamily="system-ui,sans-serif" textAnchor="middle" fill="currentColor" stroke="none">SOS</text>
    </svg>
  );
}

// Fren servo — daire içinde ünlem
export function IkonFrenServo({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Fren diski dış halkası */}
      <circle cx="12" cy="12" r="9.5" />
      <circle cx="12" cy="12" r="5.5" />
      {/* Ünlem içeride */}
      <line x1="12" y1="9" x2="12" y2="13.5" />
      <circle cx="12" cy="15" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

// ─── Sarı Uyarılar ────────────────────────────────────────────────────────────

export function IkonTPMS({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Lastik kesiti — at nalı biçimi */}
      <path d="M4 19 A8 8 0 0 1 20 19" />
      <line x1="4" y1="19" x2="4" y2="22" />
      <line x1="20" y1="19" x2="20" y2="22" />
      <line x1="4" y1="22" x2="20" y2="22" />
      {/* Sırt çizgileri */}
      <line x1="7.5" y1="22" x2="7.5" y2="20" />
      <line x1="11" y1="22" x2="11" y2="20" />
      <line x1="14.5" y1="22" x2="14.5" y2="20" />
      <line x1="18" y1="22" x2="18" y2="20" />
      {/* Ünlem */}
      <line x1="12" y1="11" x2="12" y2="15" />
      <circle cx="12" cy="16.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IkonABS({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="6" width="20" height="13" rx="3" />
      <text x="12" y="16.5" fontSize="8.5" fontWeight="bold" fontFamily="system-ui,sans-serif" textAnchor="middle" fill="currentColor" stroke="none">ABS</text>
    </svg>
  );
}

export function IkonESP({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Kayan araba yan görünümü */}
      <path d="M2 14 h20 v-4 l-3.5-4.5 H6 z" />
      <circle cx="7" cy="15.5" r="2" />
      <circle cx="17" cy="15.5" r="2" />
      {/* Kayma dalgası */}
      <path d="M2 20 q3-2.5 6 0 q3 2.5 6 0 q3-2.5 5 0" />
    </svg>
  );
}

export function IkonSarj({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Şarj kablosu konektörü */}
      <rect x="7" y="2" width="10" height="12" rx="2" />
      <line x1="10" y1="6" x2="10" y2="10" />
      <line x1="14" y1="6" x2="14" y2="10" />
      <line x1="12" y1="14" x2="12" y2="17" />
      <rect x="9" y="17" width="6" height="5" rx="1" />
    </svg>
  );
}

export function IkonBataryaDusuk({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Düşük şarjlı batarya — kısa doluluk çubuğu */}
      <rect x="1" y="7" width="17" height="11" rx="2" />
      <path d="M18 10.5h3v4h-3" />
      <rect x="3" y="9.5" width="4" height="6" rx="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IkonSilecekSuyu({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Ön cam şekli */}
      <path d="M4 19 L9 5 h6 L20 19 z" />
      {/* Silecek yayı */}
      <path d="M6.5 17 A8 8 0 0 1 18 17" />
      {/* Su damlacıkları */}
      <circle cx="10" cy="3" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="14" cy="2" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="18" cy="3.5" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IkonBataryaSicaklik({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Küçük batarya (solda) */}
      <rect x="1" y="9" width="12" height="8" rx="1.5" />
      <path d="M13 11.5h1.5v3.5H13" />
      {/* Termometre (sağda) */}
      <rect x="19" y="2" width="3" height="12" rx="1.5" />
      <circle cx="20.5" cy="17" r="2.5" />
      <line x1="20.5" y1="8" x2="20.5" y2="14" strokeWidth="2" />
    </svg>
  );
}

export function IkonBakim({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* İngiliz anahtarı */}
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

// Fren sıvısı — daire içinde ünlem (sarı varyant, fren sıvı damlasiyla)
export function IkonFrenSivisi({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Fren diski */}
      <circle cx="12" cy="13" r="8.5" />
      <circle cx="12" cy="13" r="4.5" />
      {/* Sıvı damlası yukarıda */}
      <path d="M12 2 c0 0-3 3.5-3 5.5 a3 3 0 0 0 6 0 c0-2-3-5.5-3-5.5z" />
    </svg>
  );
}

// Yolcu hava yastığı devre dışı — oturan figür + çarpı
export function IkonYolcuAirbag({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Oturan kişi */}
      <circle cx="14" cy="5" r="2.2" />
      <line x1="14" y1="7.2" x2="14" y2="13" />
      <line x1="14" y1="11" x2="11" y2="16" />
      {/* Hava yastığı balonu (solda) — küçük */}
      <circle cx="7" cy="12" r="4" />
      {/* Çarpı işareti üstünde */}
      <line x1="5" y1="10" x2="9" y2="14" strokeWidth="2" />
      <line x1="9" y1="10" x2="5" y2="14" strokeWidth="2" />
    </svg>
  );
}

// Işık arızası — ampul + çarpı
export function IkonIsikAriza({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Ampul */}
      <path d="M9 21 h6" />
      <path d="M10 17 h4" />
      <path d="M12 2 a6 6 0 0 1 4.5 9.9 L15 14 H9 L7.5 11.9 A6 6 0 0 1 12 2z" />
      {/* Çarpı işareti üst sağ köşede */}
      <line x1="18" y1="2" x2="22" y2="6" strokeWidth="2" />
      <line x1="22" y1="2" x2="18" y2="6" strokeWidth="2" />
    </svg>
  );
}

// Fren balatası — fren diski + yıpranmış balata
export function IkonFrenBalata({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Fren diski */}
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      {/* Balata kama şekli — sağ tarafta */}
      <path d="M17 12 L21 9 L21 15 Z" fill="currentColor" stroke="none" />
      {/* Aşınma göstergesi — noktalı çizgi */}
      <line x1="17" y1="12" x2="21" y2="12" strokeDasharray="1 1" />
    </svg>
  );
}

// AEB / FCW — iki araç + çarpışma çizgileri
export function IkonAEBFCW({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Öndeki araç */}
      <path d="M3 9 h8 v5 H3 z" />
      <circle cx="5" cy="15" r="1.5" />
      <circle cx="9" cy="15" r="1.5" />
      {/* Arkadaki araç */}
      <path d="M13 9 h8 v5 h-8 z" />
      <circle cx="15" cy="15" r="1.5" />
      <circle cx="19" cy="15" r="1.5" />
      {/* Çarpışma uyarı çizgileri aralarında */}
      <line x1="11" y1="10" x2="13" y2="10" strokeWidth="2" />
      <line x1="11" y1="12" x2="13" y2="12" strokeWidth="2" />
      <line x1="11" y1="14" x2="13" y2="14" strokeWidth="2" />
    </svg>
  );
}

// HV batarya düşük — batarya + yıldırım
export function IkonHVBatarya({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="1" y="6" width="18" height="13" rx="2" />
      <path d="M19 9.5h3v5h-3" />
      {/* Yıldırım içeride */}
      <path d="M11 10 L8 13.5 h4 L10 18 l5-5.5 h-4 z" fill="currentColor" stroke="none" />
    </svg>
  );
}

// Motor kısıtlı — araç silüeti + aşağı ok
export function IkonMotorSinirli({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Araç yan görünüm */}
      <path d="M2 15 h20 v-4 l-3-4 H5 z" />
      <circle cx="6.5" cy="16.5" r="2" />
      <circle cx="17.5" cy="16.5" r="2" />
      {/* Aşağı ok — performans düşük */}
      <line x1="12" y1="4" x2="12" y2="10" />
      <polyline points="9,7.5 12,10 15,7.5" />
    </svg>
  );
}

// Termal sıvı — termal ünite + damla
export function IkonTermalSivisi({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Termal blok */}
      <rect x="2" y="10" width="14" height="9" rx="1.5" />
      <line x1="5" y1="10" x2="5" y2="7" />
      <line x1="9" y1="10" x2="9" y2="7" />
      <line x1="13" y1="10" x2="13" y2="7" />
      {/* Sıvı damlası sağda */}
      <path d="M20 7 c0 0-2.5 3-2.5 4.5 a2.5 2.5 0 0 0 5 0 c0-1.5-2.5-4.5-2.5-4.5z" />
    </svg>
  );
}

// Kör nokta — araç + radar dalgaları yan
export function IkonKorNokta({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Araç üstten görünüm */}
      <rect x="7" y="5" width="10" height="15" rx="2.5" />
      <rect x="3" y="5.5" width="3.5" height="5" rx="1.2" />
      <rect x="17.5" y="5.5" width="3.5" height="5" rx="1.2" />
      {/* Radar dalgaları sağda */}
      <path d="M22 9 a3 3 0 0 1 0 6" />
      <path d="M23.5 7 a6 6 0 0 1 0 10" />
    </svg>
  );
}

// Buzlu yol — kar tanesi
export function IkonBuzYol({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* 6 kollu kar kristali */}
      <line x1="12" y1="2" x2="12" y2="22" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <line x1="4.9" y1="4.9" x2="19.1" y2="19.1" />
      <line x1="19.1" y1="4.9" x2="4.9" y2="19.1" />
      {/* Dal çıkıntıları */}
      <line x1="12" y1="5" x2="9.5" y2="7.5" />
      <line x1="12" y1="5" x2="14.5" y2="7.5" />
      <line x1="12" y1="19" x2="9.5" y2="16.5" />
      <line x1="12" y1="19" x2="14.5" y2="16.5" />
    </svg>
  );
}

// Auto hold arızası — AUTO HOLD metin kutucuğu
export function IkonOtoDurdurmaAriza({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="1" y="5" width="22" height="15" rx="2.5" />
      <text x="12" y="13" fontSize="5" fontWeight="bold" fontFamily="system-ui,sans-serif" textAnchor="middle" fill="currentColor" stroke="none">AUTO</text>
      <text x="12" y="18" fontSize="5" fontWeight="bold" fontFamily="system-ui,sans-serif" textAnchor="middle" fill="currentColor" stroke="none">HOLD</text>
      {/* Uyarı çizgisi çarpı */}
      <line x1="1" y1="5" x2="23" y2="20" strokeWidth="1" />
    </svg>
  );
}

// Uyku tespiti — göz simgesi
export function IkonUyku({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Göz dış yayı */}
      <path d="M2 12 c3-5 7-7 10-7 s7 2 10 7" />
      {/* Kapanan alt kapak — sarkık */}
      <path d="M2 12 c3 3 7 4 10 4 s7-1 10-4" />
      {/* Göz bebeği */}
      <circle cx="12" cy="12" r="2.5" />
      {/* ZZZ çizgileri sağ üstte */}
      <text x="17" y="9" fontSize="5" fontWeight="bold" fontFamily="system-ui,sans-serif" fill="currentColor" stroke="none">z</text>
    </svg>
  );
}

// ─── Yeşil / Mavi Bilgi Lambaları ─────────────────────────────────────────────

export function IkonSarjAktif({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Şarj fişi + yıldırım */}
      <rect x="7" y="2" width="10" height="12" rx="2" />
      <path d="M13 4.5 L9.5 9 h4 L11 13 l5-5.5 h-4 z" fill="currentColor" stroke="none" />
      <line x1="12" y1="14" x2="12" y2="17" />
      <rect x="9" y="17" width="6" height="5" rx="1" />
    </svg>
  );
}

export function IkonUzunFar({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Far lambası (sağda) */}
      <circle cx="20" cy="12" r="2.5" fill="currentColor" stroke="none" />
      {/* Paralel yatay ışık çizgileri (solda) */}
      <line x1="2" y1="7" x2="16" y2="7" />
      <line x1="2" y1="10" x2="16" y2="10" />
      <line x1="2" y1="13" x2="16" y2="13" />
      <line x1="2" y1="16" x2="16" y2="16" />
      {/* Çizgileri kapatan dikey çizgi */}
      <line x1="16" y1="6" x2="16" y2="17" />
    </svg>
  );
}

export function IkonSeritTakip({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Sol ve sağ şerit çizgileri */}
      <line x1="3" y1="3" x2="3" y2="22" />
      <line x1="21" y1="3" x2="21" y2="22" />
      {/* Araç üstten görünüm — ortada */}
      <rect x="8" y="7" width="8" height="13" rx="3" />
    </svg>
  );
}

export function IkonAdaptifHiz({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Hız kadranı yayı */}
      <path d="M4 17 A10 10 0 0 1 20 17" />
      {/* Gösterge ibresi */}
      <line x1="12" y1="17" x2="17.5" y2="9" />
      <circle cx="12" cy="17" r="1.5" fill="currentColor" stroke="none" />
      {/* Tik işaretleri */}
      <line x1="4.5" y1="15.5" x2="6" y2="17" />
      <line x1="8" y1="8.5" x2="9" y2="10.5" />
      <line x1="12" y1="7" x2="12" y2="9" />
      <line x1="16" y1="8.5" x2="15" y2="10.5" />
      <line x1="19.5" y1="15.5" x2="18" y2="17" />
    </svg>
  );
}

export function IkonOTA({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Yükleme halkası */}
      <path d="M21 12 A9 9 0 1 1 12 3" />
      <polyline points="12 3 16 3 16 7" />
      {/* İndirme oku */}
      <line x1="12" y1="8" x2="12" y2="16" />
      <polyline points="8 13 12 17 16 13" />
    </svg>
  );
}

// Şarj kablosu takılı (yeşil, farklı ikon — kablo fişi)
export function IkonSarjKablosu({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Kablo fişi gövdesi */}
      <rect x="8" y="3" width="8" height="10" rx="2" />
      {/* Pin çıkıntıları altta */}
      <line x1="10" y1="13" x2="10" y2="16" />
      <line x1="14" y1="13" x2="14" y2="16" />
      {/* Kablo hattı */}
      <path d="M12 16 v2 h-4 v3" />
      {/* Araç soketi */}
      <rect x="5" y="21" width="6" height="2" rx="1" />
    </svg>
  );
}

// Sürüşe hazır — HAZIR metin
export function IkonSuruseHazir({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="1" y="6" width="22" height="13" rx="3" />
      <text x="12" y="16.5" fontSize="7" fontWeight="bold" fontFamily="system-ui,sans-serif" textAnchor="middle" fill="currentColor" stroke="none">HAZIR</text>
    </svg>
  );
}

// Kısa far — far + aşağı eğimli kesik ışık çizgileri
export function IkonKisaFar({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Far lambası (sağda) */}
      <circle cx="20" cy="12" r="2.5" fill="currentColor" stroke="none" />
      {/* Dikey ayraç */}
      <line x1="16" y1="6" x2="16" y2="17" />
      {/* Kısa huzme — eğimli çizgiler (alt kısmı kesik) */}
      <line x1="2" y1="8" x2="16" y2="8" />
      <line x1="2" y1="11" x2="16" y2="11" />
      <line x1="2" y1="14" x2="14" y2="16" />
      <line x1="2" y1="17" x2="10" y2="20" />
    </svg>
  );
}

// Yokuş iniş — araç + eğimli zemin
export function IkonYokusInis({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Eğimli zemin çizgisi */}
      <line x1="1" y1="20" x2="23" y2="10" />
      {/* Araç yan görünümü */}
      <path d="M5 14 h12 v-3 l-2.5-3 H7.5 z" />
      <circle cx="8" cy="15" r="1.8" />
      <circle cx="15" cy="15" r="1.8" />
    </svg>
  );
}

// Hız sabitleyici (standart CC) — hız kadranı + sabit ibresiz
export function IkonHizSabitleyici({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Hız kadranı yayı */}
      <path d="M4 17 A10 10 0 0 1 20 17" />
      {/* Gösterge ibresi — orta sabit */}
      <line x1="12" y1="17" x2="12" y2="8" />
      <circle cx="12" cy="17" r="1.5" fill="currentColor" stroke="none" />
      {/* Tik işaretleri */}
      <line x1="4.5" y1="15.5" x2="6" y2="17" />
      <line x1="19.5" y1="15.5" x2="18" y2="17" />
      {/* SET çizgisi */}
      <line x1="8" y1="17" x2="16" y2="17" strokeDasharray="1.5 1" />
    </svg>
  );
}

// Auto hold aktif — AUTO HOLD yeşil metin
export function IkonOtoDurdurma({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="1" y="5" width="22" height="15" rx="2.5" />
      <text x="12" y="13" fontSize="5" fontWeight="bold" fontFamily="system-ui,sans-serif" textAnchor="middle" fill="currentColor" stroke="none">AUTO</text>
      <text x="12" y="18" fontSize="5" fontWeight="bold" fontFamily="system-ui,sans-serif" textAnchor="middle" fill="currentColor" stroke="none">HOLD</text>
    </svg>
  );
}

// Sağ sinyal — sağa dolu ok
export function IkonSagSinyal({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="4,7 14,12 4,17" fill="currentColor" stroke="none" />
      <polygon points="11,7 21,12 11,17" fill="currentColor" stroke="none" opacity="0.5" />
    </svg>
  );
}

// Sol sinyal — sola dolu ok
export function IkonSolSinyal({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="20,7 10,12 20,17" fill="currentColor" stroke="none" />
      <polygon points="13,7 3,12 13,17" fill="currentColor" stroke="none" opacity="0.5" />
    </svg>
  );
}

// Uzun far asistanı — uzun far + daire içinde A
export function IkonUzunFarAsistan({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Far lambası */}
      <circle cx="19" cy="12" r="2" fill="currentColor" stroke="none" />
      {/* Dikey ayraç */}
      <line x1="15" y1="6" x2="15" y2="18" />
      {/* Yatay ışık çizgileri */}
      <line x1="2" y1="8" x2="14" y2="8" />
      <line x1="2" y1="11" x2="14" y2="11" />
      <line x1="2" y1="14" x2="14" y2="14" />
      {/* Daire içinde A — sağ üst */}
      <circle cx="21" cy="5" r="3" />
      <text x="21" y="7.2" fontSize="4" fontWeight="bold" fontFamily="system-ui,sans-serif" textAnchor="middle" fill="currentColor" stroke="none">A</text>
    </svg>
  );
}

// Sis farı — eğimli far + yatay dalgalı çizgiler
export function IkonSisFar({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Far lambası (sağda) */}
      <circle cx="20" cy="10" r="2" fill="currentColor" stroke="none" />
      {/* Dikey ayraç */}
      <line x1="16" y1="5" x2="16" y2="15" />
      {/* Eğimli ışık çizgileri */}
      <line x1="2" y1="7" x2="16" y2="7" />
      <line x1="2" y1="10" x2="16" y2="10" />
      <line x1="2" y1="13" x2="16" y2="13" />
      {/* Sis dalgaları — alt kısımda */}
      <path d="M4 17 q2-1.5 4 0 q2 1.5 4 0 q2-1.5 4 0" />
      <path d="M2 20 q2-1.5 4 0 q2 1.5 4 0 q2-1.5 4 0 q2-1.5 3 0" />
    </svg>
  );
}

// Park lambası — köşe ışık simgesi
export function IkonParkLambasi({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Sol köşe lambası */}
      <rect x="2" y="8" width="5" height="8" rx="1.5" />
      <line x1="4.5" y1="6" x2="4.5" y2="8" />
      <line x1="2.5" y1="6.5" x2="4" y2="8" />
      <line x1="6.5" y1="6.5" x2="5" y2="8" />
      {/* Sağ köşe lambası */}
      <rect x="17" y="8" width="5" height="8" rx="1.5" />
      <line x1="19.5" y1="6" x2="19.5" y2="8" />
      <line x1="17.5" y1="6.5" x2="19" y2="8" />
      <line x1="21.5" y1="6.5" x2="20" y2="8" />
      {/* Araç gövdesi ortada */}
      <path d="M7 10 h10 v6 H7 z" />
    </svg>
  );
}

// ─── T10F Özgül ───────────────────────────────────────────────────────────────

export function IkonYaya({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Yürüyen insan silüeti */}
      <circle cx="12" cy="4" r="2.5" />
      <line x1="12" y1="6.5" x2="12" y2="14" />
      <line x1="8" y1="10.5" x2="16" y2="10.5" />
      <line x1="12" y1="14" x2="9" y2="21" />
      <line x1="12" y1="14" x2="15" y2="21" />
    </svg>
  );
}

export function IkonAWD({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Araç üstten görünüm — 4 teker */}
      <rect x="7" y="5" width="10" height="15" rx="2.5" />
      {/* Ön tekerlekler */}
      <rect x="3" y="5" width="3.5" height="5.5" rx="1.5" />
      <rect x="17.5" y="5" width="3.5" height="5.5" rx="1.5" />
      {/* Arka tekerlekler */}
      <rect x="3" y="13.5" width="3.5" height="5.5" rx="1.5" />
      <rect x="17.5" y="13.5" width="3.5" height="5.5" rx="1.5" />
    </svg>
  );
}

// ─── Sembol ID → İkon eşlemesi ────────────────────────────────────────────────

export const IKAZ_IKONU: Record<string, React.FC<{ className?: string }>> = {
  // Mevcut kırmızı
  "batarya-kritik": IkonBatarya,
  "fren-sistemi": IkonFren,
  "hava-yastigi": IkonHavaYastigi,
  "motor-ariza": IkonMotor,
  "yuksek-voltaj": IkonYuksekVoltaj,
  "guc-direksiyon": IkonDireksiyon,
  "park-freni": IkonParkFren,
  // Mevcut sarı
  "lastik-basinc": IkonTPMS,
  "abs-ariza": IkonABS,
  "esp-esc": IkonESP,
  "sarj-sistemi": IkonSarj,
  "batarya-dusuk": IkonBataryaDusuk,
  "on-cam-silecek-suyu": IkonSilecekSuyu,
  "batarya-sicaklik": IkonBataryaSicaklik,
  "motor-bakim": IkonBakim,
  // Mevcut bilgi
  "sarj-aktif": IkonSarjAktif,
  "uzun-far": IkonUzunFar,
  "serit-takip": IkonSeritTakip,
  "adaptif-hiz": IkonAdaptifHiz,
  "ota-guncelleme": IkonOTA,
  // T10F
  "yaya-koruma": IkonYaya,
  "awd-sistem": IkonAWD,
  // Yeni kırmızı
  "emniyet-kemeri": IkonEmniyetKemeri,
  "aku-hata": IkonAku,
  "termal-hata": IkonTermal,
  "hv-yangin": IkonYangin,
  "ecall-ariza": IkonEcall,
  "fren-servo": IkonFrenServo,
  // Yeni sarı
  "fren-sivisi": IkonFrenSivisi,
  "yolcu-hava-yastigi": IkonYolcuAirbag,
  "aku-zayif": IkonAku,
  "isik-ariza": IkonIsikAriza,
  "fren-balata": IkonFrenBalata,
  "aeb-fcw": IkonAEBFCW,
  "hv-batarya-dusuk": IkonHVBatarya,
  "motor-sinirli": IkonMotorSinirli,
  "termal-sivisi": IkonTermalSivisi,
  "kor-nokta": IkonKorNokta,
  "buz-yol": IkonBuzYol,
  "oto-durdurma-ariza": IkonOtoDurdurmaAriza,
  "uyku-tespit": IkonUyku,
  // Yeni bilgi
  "sarj-kablosu": IkonSarjKablosu,
  "suruse-hazir": IkonSuruseHazir,
  "kisa-far": IkonKisaFar,
  "yokus-inis": IkonYokusInis,
  "hiz-sabitleyici": IkonHizSabitleyici,
  "oto-durdurma": IkonOtoDurdurma,
  "sag-sinyal": IkonSagSinyal,
  "sol-sinyal": IkonSolSinyal,
  "uzun-far-asistan": IkonUzunFarAsistan,
  "sis-far": IkonSisFar,
  "park-lambasi": IkonParkLambasi,
};
