import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { FiCalendar, FiChevronDown, FiMapPin, FiSearch } from "react-icons/fi";
import MapModal from "../../../components/MapModal";
import GoogleMap from "../../../components/GoogleMap";

const vaccinesMock = [
  {
    id: "covid_pfizer",
    name: "COVID-19 (Pfizer)",
    doses: 2,
    description:
      "mRNA vaccine for COVID-19. Highly effective with recommended two doses.",
    recommendedAge: "12+",
    sideEffects: "Mild fever, fatigue, injection-site pain",
  },
  {
    id: "bcg",
    name: "BCG",
    doses: 1,
    description: "Protects against severe forms of tuberculosis.",
    recommendedAge: "Newborn",
    sideEffects: "Local skin reaction",
  },
  {
    id: "mmr",
    name: "MMR (Measles, Mumps, Rubella)",
    doses: 2,
    description: "Combined vaccine protecting against three viral infections.",
    recommendedAge: "9 months+",
    sideEffects: "Mild rash, fever",
  },
  {
    id: "hpv",
    name: "HPV",
    doses: 2,
    description:
      "Protects against human papillomavirus; prevents cervical cancers.",
    recommendedAge: "9–26",
    sideEffects: "Headache, sore arm",
  },
  {
    id: "flu",
    name: "Seasonal Influenza",
    doses: 1,
    description: "Annual protection against seasonal flu strains.",
    recommendedAge: "6 months+",
    sideEffects: "Low-grade fever, aches",
  },
];

const centresMock = [
  {
    id: "c1",
    name: "Agra Vaccination Centre",
    address: "Tajganj, Agra, Uttar Pradesh",
    lat: 27.1751498,
    lng: 78.0399519,
    availableDate: "2025-11-10T00:00:00.000Z",
  },
  {
    id: "c2",
    name: "Agra District Clinic",
    address: "Near Mathura Rd, Agra District",
    lat: 27.234567,
    lng: 77.918394,
    availableDate: "2025-11-12T00:00:00.000Z",
  },
  {
    id: "c3",
    name: "Kanpur Health Centre",
    address: "Near Kanpur, Uttar Pradesh",
    lat: 26.1751498,
    lng: 79.0399519,
    availableDate: "2025-11-15T00:00:00.000Z",
  },
];

const formatLongDate = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  const day = d.getDate();
  const suffix = (n) => {
    if (n % 10 === 1 && n % 100 !== 11) return "st";
    if (n % 10 === 2 && n % 100 !== 12) return "nd";
    if (n % 10 === 3 && n % 100 !== 13) return "rd";
    return "th";
  };
  const month = d.toLocaleString("en-GB", { month: "long" });
  const year = d.getFullYear();
  return `${day}${suffix(day)} ${month}, ${year}`;
};

const CitizenSchedule = () => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [activeCentre, setActiveCentre] = useState(centresMock[0]);
  const [showAllMarkers, setShowAllMarkers] = useState(true);
  const [mapOpen, setMapOpen] = useState(false);

  const filteredVaccines = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return vaccinesMock;
    return vaccinesMock.filter((v) => v.name.toLowerCase().includes(q));
  }, [query]);

  const mapMarkers = useMemo(
    () => centresMock.map((c) => ({ id: c.id, lat: c.lat, lng: c.lng, title: c.name })),
    []
  );

  // For right-side map, compute bounds and marker positions
  const bounds = useMemo(() => {
    const lats = centresMock.map((c) => c.lat);
    const lngs = centresMock.map((c) => c.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    return { minLat, maxLat, minLng, maxLng };
  }, []);

  const markerPos = (lat, lng) => {
    const { minLat, maxLat, minLng, maxLng } = bounds;
    const x = (lng - minLng) / (maxLng - minLng);
    const y = (maxLat - lat) / (maxLat - minLat);
    const left = `${Math.min(100, Math.max(0, x * 100))}%`;
    const top = `${Math.min(100, Math.max(0, y * 100))}%`;
    return { left, top };
  };

  const mapSrc = `https://maps.google.com/maps?q=${activeCentre.lat},${activeCentre.lng}&hl=en&z=13&output=embed`;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAB308]/20 text-[#EAB308] ring-1 ring-[#EAB308]/30">
          <FiCalendar />
        </div>
        <h2 className="text-xl font-semibold text-[#081F2E]">
          Schedule Vaccine
        </h2>
      </div>

      {/* Vaccine selector */}
      <div className="rounded-2xl bg-white/70 backdrop-blur-md shadow-sm ring-1 ring-[#081F2E]/10 p-6">
        <label className="text-sm font-medium text-[#0c2b40]">
          Select Vaccine
        </label>
        <div className="relative mt-2">
          <div className="flex items-center gap-2 rounded-xl ring-1 ring-[#081F2E]/10 bg-white px-3 py-2">
            <FiSearch className="text-[#081F2E]/70" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              placeholder="Type to search (e.g., Pfizer, BCG)"
              className="w-full bg-transparent outline-none text-[#081F2E] placeholder:text-[#0c2b40]/50"
            />
            <button
              onClick={() => setOpen((o) => !o)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#081F2E]/10 text-[#081F2E]"
            >
              <FiChevronDown />
            </button>
          </div>
          <AnimatePresence>
            {open && (
              <motion.ul
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ type: "spring", stiffness: 260, damping: 24 }}
                className="absolute z-40 mt-2 w-full max-h-56 overflow-auto rounded-xl bg-white shadow-lg ring-1 ring-[#081F2E]/10"
              >
                {filteredVaccines.map((v) => (
                  <li
                    key={v.id}
                    className="px-3 py-2 text-sm text-[#081F2E] hover:bg-[#081F2E]/5 cursor-pointer"
                    onClick={() => {
                      setSelected(v);
                      setOpen(false);
                    }}
                  >
                    {v.name}
                  </li>
                ))}
                {filteredVaccines.length === 0 && (
                  <li className="px-3 py-2 text-sm text-[#0c2b40]/70">
                    No matches
                  </li>
                )}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

        {/* Vaccine details */}
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="mt-4 rounded-xl bg-white shadow-sm ring-1 ring-[#081F2E]/10 p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold text-[#081F2E]">
                  {selected.name}
                </div>
                <div className="text-sm text-[#0c2b40]/70">
                  Recommended Age: {selected.recommendedAge}
                </div>
              </div>
              <div className="text-sm font-medium text-[#081F2E]">
                Doses: {selected.doses}
              </div>
            </div>
            <p className="mt-2 text-sm text-[#0c2b40]/80">
              {selected.description}
            </p>
            <div className="mt-2 text-sm text-[#0c2b40]/70">
              Common Side Effects: {selected.sideEffects}
            </div>
          </motion.div>
        )}
      </div>

      {/* Centres + Map layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Centres list */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
          className="rounded-2xl bg-white/70 backdrop-blur-md shadow-sm ring-1 ring-[#081F2E]/10 p-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#F04E36]/10 text-[#F04E36] ring-1 ring-[#F04E36]/20">
              <FiMapPin />
            </div>
            <h3 className="text-lg font-semibold text-[#081F2E]">
              Available Centres
            </h3>
          </div>
          <div className="space-y-3">
            {centresMock.map((c) => (
              <div
                key={c.id}
                className="rounded-xl bg-white ring-1 ring-[#081F2E]/10 p-4 flex items-start justify-between"
              >
                <div>
                  <div className="font-semibold text-[#081F2E]">{c.name}</div>
                  <div className="text-sm text-[#0c2b40]/70">{c.address}</div>
                  <div className="text-sm text-[#0c2b40]/70">
                    Available: {formatLongDate(c.availableDate)}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={() => {
                      setActiveCentre(c);
                      setMapOpen(true);
                    }}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#EAB308] text-white px-3 py-2 text-sm font-medium hover:bg-[#d4a006]"
                  >
                    <FiMapPin />
                    <span>Map</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveCentre(c);
                      setShowAllMarkers(false);
                    }}
                    className="text-xs text-[#081F2E]/70 hover:text-[#081F2E]"
                  >
                    Show on right map
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right-side map with all markers overlay */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
          className="rounded-2xl bg-white/70 backdrop-blur-md shadow-sm ring-1 ring-[#081F2E]/10 p-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAB308]/20 text-[#EAB308] ring-1 ring-[#EAB308]/30">
              <FiMapPin />
            </div>
            <h3 className="text-lg font-semibold text-[#081F2E]">
              Centres Map
            </h3>
          </div>
          <div className="mb-2 flex items-center justify-between">
            <div className="text-xs text-[#0c2b40]/60">
              Click a marker or select a centre.
            </div>
            {!showAllMarkers && (
              <button
                onClick={() => setShowAllMarkers(true)}
                className="text-xs rounded-lg px-2 py-1 bg-[#081F2E]/5 text-[#081F2E] ring-1 ring-[#081F2E]/10 hover:bg-[#081F2E]/10"
              >
                Show all markers
              </button>
            )}
          </div>
          <GoogleMap
            markers={mapMarkers}
            activeId={activeCentre.id}
            showAll={showAllMarkers}
            onMarkerClick={(m) => {
              setActiveCentre(m);
              setShowAllMarkers(false);
            }}
            height={380}
          />
        </motion.div>
      </div>

      {/* Map modal */}
      <MapModal
        isOpen={mapOpen}
        onClose={() => setMapOpen(false)}
        lat={activeCentre.lat}
        lng={activeCentre.lng}
        title={activeCentre.name}
      />
    </motion.section>
  );
};

export default CitizenSchedule;
