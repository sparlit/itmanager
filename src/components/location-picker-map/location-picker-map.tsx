"use client";

interface LocationPickerMapProps {
  latitude: number;
  longitude: number;
  onLocationChange: (lat: number, lng: number) => void;
}

export function LocationPickerMap({ latitude, longitude, onLocationChange }: LocationPickerMapProps) {
  void onLocationChange;

  return (
    <div className="h-[30rem] rounded-lg overflow-hidden border border-slate-200 relative">
      <iframe
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        src={`https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.01}%2C${latitude - 0.01}%2C${longitude + 0.01}%2C${latitude + 0.01}&layer=mapnik&marker=${latitude}%2C${longitude}`}
      />
      <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded text-xs shadow">
        📍 {latitude.toFixed(4)}, {longitude.toFixed(4)}
      </div>
    </div>
  );
}

export default LocationPickerMap;
