import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FiBarChart2, FiMapPin, FiPieChart } from "react-icons/fi";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import GoogleMap from "../../../components/GoogleMap";
import { getVaccineCentres } from "../../../services/centreService";

// Real-world district HQ coordinates (approximate centroids)
const BD_DISTRICTS = [
  // Dhaka Division
  { name: "Dhaka", lat: 23.777176, lng: 90.399452 },
  { name: "Faridpur", lat: 23.607, lng: 89.842 },
  { name: "Gazipur", lat: 24.002, lng: 90.42 },
  { name: "Gopalganj", lat: 23.005, lng: 89.826 },
  { name: "Kishoreganj", lat: 24.43, lng: 90.78 },
  { name: "Madaripur", lat: 23.17, lng: 90.21 },
  { name: "Manikganj", lat: 23.86, lng: 90.0 },
  { name: "Munshiganj", lat: 23.55, lng: 90.52 },
  { name: "Narayanganj", lat: 23.61, lng: 90.5 },
  { name: "Narsingdi", lat: 23.92, lng: 90.72 },
  { name: "Rajbari", lat: 23.75, lng: 89.64 },
  { name: "Shariatpur", lat: 23.23, lng: 90.35 },
  { name: "Tangail", lat: 24.251, lng: 89.92 },

  // Mymensingh Division
  { name: "Mymensingh", lat: 24.7471, lng: 90.4203 },
  { name: "Jamalpur", lat: 24.921, lng: 89.95 },
  { name: "Netrokona", lat: 24.88, lng: 90.73 },
  { name: "Sherpur", lat: 25.02, lng: 90.02 },

  // Chattogram Division
  { name: "Chattogram", lat: 22.3569, lng: 91.7832 },
  { name: "Cox's Bazar", lat: 21.45, lng: 91.97 },
  { name: "Bandarban", lat: 22.2, lng: 92.22 },
  { name: "Rangamati", lat: 22.66, lng: 92.17 },
  { name: "Khagrachhari", lat: 23.1, lng: 91.97 },
  { name: "Feni", lat: 23.02, lng: 91.39 },
  { name: "Noakhali", lat: 22.87, lng: 91.1 },
  { name: "Lakshmipur", lat: 22.95, lng: 90.84 },
  { name: "Cumilla", lat: 23.46, lng: 91.18 },
  { name: "Brahmanbaria", lat: 23.96, lng: 91.11 },
  { name: "Chandpur", lat: 23.24, lng: 90.65 },

  // Barishal Division
  { name: "Barishal", lat: 22.701, lng: 90.353 },
  { name: "Bhola", lat: 22.68, lng: 90.65 },
  { name: "Patuakhali", lat: 22.35, lng: 90.32 },
  { name: "Barguna", lat: 22.15, lng: 90.13 },
  { name: "Jhalokathi", lat: 22.64, lng: 90.2 },
  { name: "Pirojpur", lat: 22.58, lng: 89.97 },

  // Khulna Division
  { name: "Khulna", lat: 22.8456, lng: 89.5403 },
  { name: "Bagerhat", lat: 22.66, lng: 89.65 },
  { name: "Satkhira", lat: 22.33, lng: 89.08 },
  { name: "Jashore", lat: 23.17, lng: 89.21 },
  { name: "Narail", lat: 23.17, lng: 89.51 },
  { name: "Magura", lat: 23.48, lng: 89.42 },
  { name: "Jhenaidah", lat: 23.53, lng: 89.16 },
  { name: "Chuadanga", lat: 23.64, lng: 88.85 },
  { name: "Kushtia", lat: 23.9, lng: 89.12 },
  { name: "Meherpur", lat: 23.76, lng: 88.64 },

  // Rajshahi Division
  { name: "Rajshahi", lat: 24.374, lng: 88.6042 },
  { name: "Natore", lat: 24.42, lng: 88.99 },
  { name: "Naogaon", lat: 24.8, lng: 88.92 },
  { name: "Chapai Nawabganj", lat: 24.6, lng: 88.27 },
  { name: "Bogura", lat: 24.85, lng: 89.37 },
  { name: "Joypurhat", lat: 25.1, lng: 89.02 },
  { name: "Sirajganj", lat: 24.45, lng: 89.7 },
  { name: "Pabna", lat: 24.0, lng: 89.23 },

  // Rangpur Division
  { name: "Rangpur", lat: 25.7558, lng: 89.2445 },
  { name: "Dinajpur", lat: 25.63, lng: 88.63 },
  { name: "Thakurgaon", lat: 26.0337, lng: 88.4617 },
  { name: "Panchagarh", lat: 26.33, lng: 88.54 },
  { name: "Kurigram", lat: 25.805, lng: 89.636 },
  { name: "Lalmonirhat", lat: 25.9, lng: 89.45 },
  { name: "Nilphamari", lat: 25.94, lng: 88.86 },
  { name: "Gaibandha", lat: 25.34, lng: 89.54 },

  // Sylhet Division
  { name: "Sylhet", lat: 24.8949, lng: 91.8687 },
  { name: "Habiganj", lat: 24.38, lng: 91.41 },
  { name: "Moulvibazar", lat: 24.48, lng: 91.77 },
  { name: "Sunamganj", lat: 25.07, lng: 91.41 },
];

// Dummy age-group vaccination counts
const VACCINATION_BY_AGE = [
  { age: "0-9", count: 12000 },
  { age: "10-19", count: 42000 },
  { age: "20-29", count: 76000 },
  { age: "30-39", count: 82000 },
  { age: "40-49", count: 69000 },
  { age: "50-59", count: 54000 },
  { age: "60+", count: 33000 },
];

// Dummy gender distribution
const VACCINATION_BY_GENDER = [
  { name: "Male", value: 520000 },
  { name: "Female", value: 480000 },
];

const AuthorityVisualization = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [centreMarkers, setCentreMarkers] = useState([]);

  useEffect(() => {
    const fetchCentres = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getVaccineCentres();
        const list = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
          ? res.data
          : res?.data?.data || [];
        const markers = list
          .map((c, idx) => ({
            id: c.id ?? c.vc_id ?? idx + 1,
            title: c.name,
            lat: Number(c.lattitude ?? c.latitude ?? NaN),
            lng: Number(c.longitude ?? NaN),
          }))
          .filter((m) => Number.isFinite(m.lat) && Number.isFinite(m.lng));
        setCentreMarkers(markers);
      } catch (err) {
        setError(err?.message || "Failed to load vaccine centres");
      } finally {
        setLoading(false);
      }
    };
    fetchCentres();
  }, []);

  const genderColors = ["#081F2E", "#EAB308"]; // male, female
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#081F2E]/15 text-[#081F2E] ring-1 ring-[#081F2E]/25">
          <FiBarChart2 />
        </div>
        <h2 className="text-xl font-semibold text-[#081F2E]">Visualization</h2>
      </div>

      {/* Map: Vaccine Centres Map */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 22 }}
        viewport={{ once: true }}
        className="rounded-2xl bg-white/70 backdrop-blur-md shadow-sm ring-1 ring-[#081F2E]/10 p-6"
      >
        <div className="flex items-center gap-2 text-[#0c2b40] mb-3">
          <FiMapPin className="text-[#081F2E]" />
          <span className="text-sm">Vaccine Centres Map</span>
          <span className="ml-auto text-xs text-[#0c2b40]/60">
            Markers: {centreMarkers.length}
          </span>
        </div>
        {loading ? (
          <div className="h-[420px] rounded-xl bg-white ring-1 ring-[#081F2E]/10 p-4 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 240, damping: 20 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="h-10 w-10 rounded-full border-2 border-[#081F2E] border-t-transparent animate-spin" />
              <div className="text-xs text-[#0c2b40]/70">
                Loading centres...
              </div>
            </motion.div>
          </div>
        ) : error ? (
          <div className="h-[420px] rounded-xl bg-white ring-1 ring-[#081F2E]/10 p-4 grid place-items-center">
            <div className="text-sm text-[#B00020]">{error}</div>
          </div>
        ) : (
          <GoogleMap
            markers={centreMarkers}
            showAll
            height={420}
            className="ring-1 ring-[#081F2E]/10"
          />
        )}
      </motion.div>

      {/* Vaccination By Age: Bar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 22 }}
        viewport={{ once: true }}
        className="rounded-2xl bg-white/70 backdrop-blur-md shadow-sm ring-1 ring-[#081F2E]/10 p-6"
      >
        <div className="text-sm text-[#0c2b40]/80 mb-3">Vaccination By Age</div>
        <div className="h-72 rounded-xl bg-white ring-1 ring-[#081F2E]/10 p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={VACCINATION_BY_AGE} barCategoryGap={10}>
              <XAxis
                dataKey="age"
                tick={{ fill: "#0c2b40" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fill: "#0c2b40" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ fill: "#081F2E10" }}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Bar
                dataKey="count"
                fill="#2FC94E"
                radius={[8, 8, 0, 0]}
                animationDuration={650}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Vaccination By Gender: Pie Chart */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 22 }}
        viewport={{ once: true }}
        className="rounded-2xl bg-white/70 backdrop-blur-md shadow-sm ring-1 ring-[#081F2E]/10 p-6"
      >
        <div className="flex items-center gap-2 text-[#0c2b40] mb-3">
          <FiPieChart className="text-[#081F2E]" />
          <span className="text-sm">Vaccination By Gender</span>
        </div>
        <div className="h-72 rounded-xl bg-white ring-1 ring-[#081F2E]/10 p-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={VACCINATION_BY_GENDER}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={96}
                paddingAngle={3}
              >
                {VACCINATION_BY_GENDER.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={genderColors[index % genderColors.length]}
                  />
                ))}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Legend
                verticalAlign="bottom"
                height={24}
                formatter={(v) => (
                  <span className="text-[#0c2b40] text-xs">{v}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </motion.section>
  );
};

export default AuthorityVisualization;
