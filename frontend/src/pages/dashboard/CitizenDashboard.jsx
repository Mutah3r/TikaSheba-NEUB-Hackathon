import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import {
  FiCalendar,
  FiCreditCard,
  FiEye,
  FiEyeOff,
  FiMapPin,
  FiUser,
  FiXCircle,
} from "react-icons/fi";
import MapModal from "../../components/MapModal";
import CancelModal from "../../components/CancelModal";
import PdfModal from "../../components/PdfModal";

const CitizenDashboard = () => {
  // Dummy profile data (can be wired to backend later)
  const profile = useMemo(
    () => ({
      name: "Md. Rahim Uddin",
      nidOrBirth: "1990123456789",
      tikaRegNo: "TS-00012345",
      dob: "1995-04-21",
    }),
    []
  );

  const [showSensitive, setShowSensitive] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [selectedLoc, setSelectedLoc] = useState({
    lat: 23.8103,
    lng: 90.4125,
    title: "Centre Location",
  });

  const [upcoming, setUpcoming] = useState([
    {
      vaccine: "COVID-19 Booster",
      centre: "Dhaka Central Vaccination Centre",
      date: "2025-12-02",
      lat: 23.780573,
      lng: 90.407604,
    },
    {
      vaccine: "Hepatitis B",
      centre: "Banani Health Complex",
      date: "2025-12-12",
      lat: 23.7935,
      lng: 90.4043,
    },
    {
      vaccine: "Influenza Seasonal",
      centre: "Uttara Medical Point",
      date: "2025-12-28",
      lat: 23.8766,
      lng: 90.38,
    },
  ]);

  const history = [
    {
      vaccine: "COVID-19",
      doses: 2,
      lastDate: "2024-09-14",
      lastCentre: "Dhaka Central Vaccination Centre",
    },
    {
      vaccine: "Tetanus",
      doses: 1,
      lastDate: "2023-06-20",
      lastCentre: "Banani Health Complex",
    },
    {
      vaccine: "Hepatitis A",
      doses: 2,
      lastDate: "2022-11-05",
      lastCentre: "Uttara Medical Point",
    },
  ];

  const openMap = (row) => {
    setSelectedLoc({ lat: row.lat, lng: row.lng, title: `${row.centre}` });
    setMapOpen(true);
  };

  const [cancelOpen, setCancelOpen] = useState(false);
  const [toCancel, setToCancel] = useState(null);
  const openCancel = (row, index) => {
    setToCancel({ ...row, index });
    setCancelOpen(true);
  };
  const confirmCancel = () => {
    if (toCancel?.index != null) {
      setUpcoming((prev) => prev.filter((_, i) => i !== toCancel.index));
    }
    setCancelOpen(false);
    setToCancel(null);
  };

  const formatLongDate = (iso) => {
    try {
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
    } catch {
      return iso;
    }
  };

  const [pdfOpen, setPdfOpen] = useState(false);
  const pdfUrl = "https://pdfobject.com/pdf/sample.pdf";

  return (
    <div className="relative">
      {/* Floating Action Panel */}
      <motion.aside
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: "spring", stiffness: 240, damping: 22 }}
        className="hidden lg:block fixed right-6 top-24 w-[320px] rounded-2xl bg-white shadow-xl ring-1 ring-[#081F2E]/10 overflow-hidden"
      >
        <div className="relative p-5">
          <div className="absolute -z-10 -top-6 -right-6 w-32 h-32 rounded-full bg-[#F04E36]/10 blur-xl" />
          <div className="absolute -z-10 -bottom-6 -left-6 w-32 h-32 rounded-full bg-[#EAB308]/20 blur-xl" />
          <div className="flex items-center gap-3 mb-4">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAB308]/20 text-[#EAB308]">
              <FiUser />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#081F2E]">
                {profile.name}
              </h3>
              <p className="text-xs text-[#0c2b40]/70">Citizen</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="grid gap-1">
              <div className="text-xs font-medium text-[#0c2b40]/70">
                NID / Birth Certificate No
              </div>
              <div className="flex items-center justify-between rounded-xl border border-[#EAB308]/30 bg-white px-3 py-2">
                <div className="font-mono tracking-wide text-sm text-[#081F2E]">
                  {showSensitive ? profile.nidOrBirth : "•••••••••••••"}
                </div>
                <button
                  onClick={() => setShowSensitive((v) => !v)}
                  className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-[#081F2E]/5 text-[#081F2E] hover:bg-[#081F2E]/10"
                  aria-label="Toggle visibility"
                >
                  {showSensitive ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div className="grid gap-1">
              <div className="text-xs font-medium text-[#0c2b40]/70">
                Tika Registration No
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-[#EAB308]/30 bg-white px-3 py-2">
                <FiCreditCard className="text-[#0c2b40]/60" />
                <div className="font-mono text-sm text-[#081F2E]">
                  {profile.tikaRegNo}
                </div>
              </div>
            </div>

            <div className="grid gap-1">
              <div className="text-xs font-medium text-[#0c2b40]/70">
                Date of Birth
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-[#EAB308]/30 bg-white px-3 py-2">
                <FiCalendar className="text-[#0c2b40]/60" />
                <div className="text-sm text-[#081F2E]">{profile.dob}</div>
              </div>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="space-y-6 pr-0 lg:pr-[360px]">
        {/* Upcoming Schedule */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 240, damping: 22 }}
          className="rounded-2xl bg-white shadow ring-1 ring-[#F04E36]/10 overflow-hidden"
        >
          <div className="p-5 border-b border-[#081F2E]/10 flex items-center justify-between">
            <h2 className="text-xl font-bold">Upcoming Schedule</h2>
          </div>
          <div className="p-5">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-[#FFF5E6] via-[#fff] to-[#FFEFEA]">
                    <th className="text-left px-4 py-3 text-sm font-semibold text-[#0c2b40]">
                      Vaccine Name
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-[#0c2b40]">
                      Centre Name
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-[#0c2b40]">
                      Date
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-[#0c2b40]">Cancel</th>
                  </tr>
                </thead>
                <tbody>
                  {upcoming.map((row, idx) => (
                    <motion.tr
                      key={idx}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="border-t border-[#081F2E]/10 hover:bg-[#081F2E]/3"
                    >
                      <td className="px-4 py-3 text-[#081F2E] font-medium">
                        {row.vaccine}
                      </td>
                      <td className="px-4 py-3 text-[#0c2b40]">
                        <div className="flex items-center gap-2">
                          <span>{row.centre}</span>
                          <button
                            onClick={() => openMap(row)}
                            className="inline-flex items-center gap-1 rounded-lg bg-[#EAB308]/20 text-[#081F2E] px-2 py-1 text-xs hover:bg-[#EAB308]/30"
                          >
                            <FiMapPin /> Map
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[#0c2b40]">{formatLongDate(row.date)}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => openCancel(row, idx)}
                          className="inline-flex items-center gap-1 rounded-lg bg-[#F04E36]/10 text-[#F04E36] px-2 py-1 text-xs hover:bg-[#F04E36]/20"
                        >
                          <FiXCircle /> Cancel
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.section>

        {/* E‑Vaccine Card */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 240, damping: 22 }}
          className="rounded-2xl bg-white shadow ring-1 ring-[#081F2E]/10 overflow-hidden"
        >
          <div className="p-5 border-b border-[#081F2E]/10 flex items-center justify-between">
            <h2 className="text-xl font-bold">E‑Vaccine Card</h2>
            <button
              onClick={() => setPdfOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#EAB308] text-[#081F2E] px-3 py-2 text-sm hover:bg-[#d1a207]"
            >
              View Card
            </button>
          </div>
          <div className="p-5">
            <p className="text-sm text-[#0c2b40]/80">
              Access your digitally signed vaccine card. View and download for official use.
            </p>
          </div>
        </motion.section>

        {/* Vaccination History */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 240, damping: 22 }}
          className="rounded-2xl bg-white shadow ring-1 ring-[#081F2E]/10 overflow-hidden"
        >
          <div className="p-5 border-b border-[#081F2E]/10">
            <h2 className="text-xl font-bold">Vaccination History</h2>
          </div>
          <div className="p-5">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-[#FFF5E6] via-[#fff] to-[#FFEFEA]">
                    <th className="text-left px-4 py-3 text-sm font-semibold text-[#0c2b40]">
                      Vaccine Name
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-[#0c2b40]">
                      Dose Count
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-[#0c2b40]">
                      Last Date
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-[#0c2b40]">
                      Last Centre
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((row, idx) => (
                    <motion.tr
                      key={idx}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="border-t border-[#081F2E]/10 hover:bg-[#081F2E]/3"
                    >
                      <td className="px-4 py-3 text-[#081F2E] font-medium">
                        {row.vaccine}
                      </td>
                      <td className="px-4 py-3 text-[#0c2b40]">{row.doses}</td>
                      <td className="px-4 py-3 text-[#0c2b40]">
                        {row.lastDate}
                      </td>
                      <td className="px-4 py-3 text-[#0c2b40]">
                        {row.lastCentre}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.section>
      </div>

      {/* Map Modal */}
      <MapModal
        isOpen={mapOpen}
        onClose={() => setMapOpen(false)}
        lat={selectedLoc.lat}
        lng={selectedLoc.lng}
        title={selectedLoc.title}
      />

      {/* Cancel Modal */}
      <CancelModal
        isOpen={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={confirmCancel}
        centre={toCancel?.centre}
        date={toCancel ? formatLongDate(toCancel.date) : ""}
      />

      {/* PDF Modal */}
      <PdfModal isOpen={pdfOpen} onClose={() => setPdfOpen(false)} pdfUrl={pdfUrl} title="E‑Vaccine Card" />
    </div>
  );
};

export default CitizenDashboard;
