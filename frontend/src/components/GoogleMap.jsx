import { useEffect, useRef, useState } from "react";

const GoogleMap = ({
  markers = [],
  activeId,
  showAll = true,
  onMarkerClick,
  height = 380,
  className = "",
}) => {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerObjsRef = useRef([]);
  const [ready, setReady] = useState(Boolean(window.google?.maps));

  useEffect(() => {
    if (window.google?.maps) {
      setReady(true);
      return;
    }
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setReady(false);
      return;
    }
    let script = document.querySelector('script[data-google-maps]');
    if (!script) {
      script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
      script.async = true;
      script.defer = true;
      script.setAttribute('data-google-maps', 'true');
      script.addEventListener('load', () => setReady(true));
      document.head.appendChild(script);
    } else {
      script.addEventListener('load', () => setReady(true));
    }
  }, []);

  useEffect(() => {
    if (!ready || !containerRef.current) return;
    if (!mapRef.current) {
      const first = markers[0] || { lat: 23.8103, lng: 90.4125 };
      mapRef.current = new window.google.maps.Map(containerRef.current, {
        center: { lat: first.lat, lng: first.lng },
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      });
    }

    // Clear previous markers
    markerObjsRef.current.forEach((m) => m.setMap(null));
    markerObjsRef.current = [];

    const map = mapRef.current;

    if (showAll && markers.length) {
      const bounds = new window.google.maps.LatLngBounds();
      markers.forEach((m) => {
        const pos = { lat: m.lat, lng: m.lng };
        const marker = new window.google.maps.Marker({
          position: pos,
          map,
          title: m.title || "",
        });
        marker.addListener("click", () => onMarkerClick?.(m));
        markerObjsRef.current.push(marker);
        bounds.extend(pos);
      });
      map.fitBounds(bounds);
    } else if (markers.length) {
      const active = markers.find((m) => m.id === activeId) || markers[0];
      const pos = { lat: active.lat, lng: active.lng };
      map.setCenter(pos);
      map.setZoom(13);
      const marker = new window.google.maps.Marker({
        position: pos,
        map,
        title: active.title || "",
      });
      marker.addListener("click", () => onMarkerClick?.(active));
      markerObjsRef.current.push(marker);
    }
  }, [ready, markers, activeId, showAll, onMarkerClick]);

  return (
    <div className={`relative rounded-xl overflow-hidden ring-1 ring-[#081F2E]/10 ${className}`}>
      <div ref={containerRef} style={{ height }} />
      {!ready && (
        <div className="absolute inset-0 grid place-items-center bg-white/60 text-[#0c2b40]/70 text-sm">
          <div className="rounded-lg px-3 py-2 ring-1 ring-[#081F2E]/10 bg-white">
            Google Map unavailable. Add VITE_GOOGLE_MAPS_API_KEY.
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleMap;