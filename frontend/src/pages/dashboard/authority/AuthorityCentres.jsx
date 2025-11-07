import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import {
  FiKey,
  FiList,
  FiMapPin,
  FiPlus,
  FiSearch,
  FiUsers,
  FiX,
} from "react-icons/fi";
import GoogleMap from "../../../components/GoogleMap";
import MapModal from "../../../components/MapModal";
import Notification from "../../../components/Notification";
import { getVaccines } from "../../../services/authorityService";
import {
  getVaccineCentres,
  registerVaccineCentre,
  updateVaccineCentre,
} from "../../../services/centreService";
import {
  assignVaccineToCentre,
  listAssignedCentreVaccinesByCentre,
} from "../../../services/centreVaccineService";

// Catalogue fetched from API for vaccine dropdown

const INITIAL_CENTRES = [
  {
    id: "c001",
    name: "Dhaka Medical Centre",
    address: "Panthapath, Dhaka",
    lat: 23.8103,
    lng: 90.4125,
    password: "",
    allowedVaccines: ["v001", "v002", "v003"],
  },
  {
    id: "c002",
    name: "Chittagong Urban Clinic",
    address: "Agrabad, Chattogram",
    lat: 22.3569,
    lng: 91.7832,
    password: "",
    allowedVaccines: ["v002"],
  },
  {
    id: "c003",
    name: "Rajshahi Health Point",
    address: "Kazla, Rajshahi",
    lat: 24.374,
    lng: 88.6042,
    password: "",
    allowedVaccines: ["v003", "v004"],
  },
  {
    id: "c004",
    name: "Sylhet Vaccination Hub",
    address: "Amberkhana, Sylhet",
    lat: 24.8949,
    lng: 91.8687,
    password: "",
    allowedVaccines: ["v001", "v005"],
  },
];

const AuthorityCentres = () => {
  const [centres, setCentres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({
    show: false,
    type: "success",
    message: "",
  });
  const [mapView, setMapView] = useState({
    open: false,
    lat: null,
    lng: null,
    title: "Centre Location",
  });
  const [pwdModal, setPwdModal] = useState({
    open: false,
    centre: null,
    pwd: "",
  });
  const [pwdUpdating, setPwdUpdating] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newCentre, setNewCentre] = useState({
    id: "",
    name: "",
    address: "",
    district: "",
    password: "",
    lat: 23.8103,
    lng: 90.4125,
  });
  const [vaccinesModal, setVaccinesModal] = useState({
    open: false,
    centreId: null,
    selectedId: "",
  });
  const [assignedVaccines, setAssignedVaccines] = useState([]);
  const [assignedLoading, setAssignedLoading] = useState(false);
  const [assignedError, setAssignedError] = useState("");
  const [assigningVaccine, setAssigningVaccine] = useState(false);
  const [catalogVaccines, setCatalogVaccines] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogError, setCatalogError] = useState("");
  const [search, setSearch] = useState("");

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
      const mapped = list.map((c) => ({
        id: c.id ?? c.vc_id ?? "",
        vc_id: c.vc_id,
        name: c.name,
        address: c.location,
        district: c.district,
        lat: Number(c.lattitude ?? c.latitude ?? 0),
        lng: Number(c.longitude ?? 0),
        staff_count: Number(c.staff_count ?? 0),
        allowedVaccines: [],
      }));
      setCentres(mapped);
    } catch (err) {
      const msg = err?.message || "Failed to load centres";
      setError(msg);
      setToast({ show: true, type: "error", message: msg });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCentres();
  }, []);

  const filteredCentres = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return centres;
    const tokens = q.split(/\s+/).filter(Boolean);
    return centres.filter((c) => {
      const name = String(c.name || "").toLowerCase();
      return tokens.every((t) => name.includes(t));
    });
  }, [search, centres]);

  const nextId = () => {
    const nums = centres
      .map((c) => parseInt(c.id.replace(/\D/g, ""), 10))
      .filter((n) => Number.isFinite(n));
    const max = nums.length ? Math.max(...nums) : 0;
    const next = (max || 0) + 1;
    return `c${String(next).padStart(3, "0")}`;
  };

  const openMap = (c) =>
    setMapView({
      open: true,
      lat: c.lat,
      lng: c.lng,
      title: `${c.name} (${c.id})`,
    });
  const closeMap = () =>
    setMapView({ open: false, lat: null, lng: null, title: "Centre Location" });

  const openPwd = (c) => setPwdModal({ open: true, centre: c, pwd: "" });
  const closePwd = () => setPwdModal({ open: false, centre: null, pwd: "" });
  const confirmPwd = async () => {
    if (!pwdModal.centre) return;
    const newPwd = (pwdModal.pwd || "").trim();
    if (!newPwd) {
      setToast({
        show: true,
        type: "error",
        message: "Please enter a new password.",
      });
      return;
    }
    if (pwdUpdating) return;
    try {
      setPwdUpdating(true);
      const c = pwdModal.centre;
      const idParam = c.id;
      await updateVaccineCentre(idParam, {
        name: c.name,
        location: c.address,
        district: c.district,
        lattitude: Number(c.lat ?? 0),
        longitude: Number(c.lng ?? 0),
        password: newPwd,
      });
      setCentres((prev) =>
        prev.map((x) => (x.id === c.id ? { ...x, password: newPwd } : x))
      );
      setToast({
        show: true,
        type: "success",
        message: "Password updated successfully.",
      });
      closePwd();
    } catch (err) {
      setToast({
        show: true,
        type: "error",
        message: err?.message || "Failed to update password.",
      });
    } finally {
      setPwdUpdating(false);
    }
  };

  const openAdd = () => {
    setNewCentre({
      id: "",
      name: "",
      address: "",
      district: "",
      password: "",
      lat: 23.8103,
      lng: 90.4125,
    });
    setAddOpen(true);
  };
  const closeAdd = () => setAddOpen(false);
  const confirmAdd = async () => {
    if (adding) return;
    const vc_id = newCentre.id.trim() || nextId();
    const name = newCentre.name.trim();
    const location = newCentre.address.trim();
    const district = (newCentre.district || "").trim();
    const password = newCentre.password;
    const lattitude = Number(newCentre.lat);
    const longitude = Number(newCentre.lng);
    if (!name || !location || !vc_id || !password) {
      setToast({
        show: true,
        type: "error",
        message: "Please provide name, address, centre ID, and password.",
      });
      return;
    }
    setAdding(true);
    try {
      await registerVaccineCentre({
        name,
        location,
        district,
        lattitude,
        longitude,
        vc_id,
        password,
      });
      setAddOpen(false);
      setToast({
        show: true,
        type: "success",
        message: "Centre added successfully.",
      });
      await fetchCentres();
    } catch (err) {
      const msg = err?.message || "Failed to add centre";
      setToast({ show: true, type: "error", message: msg });
    } finally {
      setAdding(false);
    }
  };

  const openVaccines = (centreId) =>
    setVaccinesModal({ open: true, centreId, selectedId: "" });
  const closeVaccines = () =>
    setVaccinesModal({ open: false, centreId: null, selectedId: "" });
  const centreById = (id) => centres.find((c) => c.id === id);
  const notAddedOptions = useMemo(() => {
    if (!vaccinesModal.centreId) return [];
    const assignedSet = new Set(assignedVaccines.map((a) => a.id));
    return catalogVaccines
      .filter((v) => !assignedSet.has(v.id))
      .map((v) => ({ id: v.id, name: v.name }));
  }, [vaccinesModal.centreId, assignedVaccines, catalogVaccines]);
  const addVaccineToCentre = async () => {
    const vid = vaccinesModal.selectedId;
    if (!vid || !vaccinesModal.centreId) return;
    const centre = centreById(vaccinesModal.centreId);
    const centre_id = centre?.vc_id || centre?.id || vaccinesModal.centreId;
    const found = catalogVaccines.find((v) => v.id === vid);
    const vaccine_name = found?.name || "";
    setAssigningVaccine(true);
    try {
      await assignVaccineToCentre({ centre_id, vaccine_id: vid, vaccine_name });
      // Optimistically update assigned list for immediate feedback
      const exists = assignedVaccines.some((v) => v.id === vid);
      if (!exists) {
        setAssignedVaccines((prev) => [
          ...prev,
          {
            id: vid,
            name: vaccine_name,
            description: found?.description || "",
          },
        ]);
      }
      setToast({
        show: true,
        type: "success",
        message: "Vaccine assigned successfully.",
      });
      // Optionally refresh from server for consistency
      try {
        setAssignedLoading(true);
        const res = await listAssignedCentreVaccinesByCentre(centre_id);
        const list = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
          ? res.data
          : res?.data?.data || [];
        const normalized = list.map((a, idx) => ({
          id: a.id ?? a.vaccine_id ?? `row-${idx}`,
          name: a.name ?? a.vaccine_name ?? "Unknown Vaccine",
          description: a.description ?? "",
        }));
        setAssignedVaccines(normalized);
      } catch (refreshErr) {
        // Keep optimistic state if refresh fails; surface a subtle error toast
        setToast({
          show: true,
          type: "error",
          message:
            refreshErr?.message || "Failed to refresh assigned vaccines.",
        });
      } finally {
        setAssignedLoading(false);
      }
      // Reset selection
      setVaccinesModal((s) => ({ ...s, selectedId: "" }));
    } catch (err) {
      const msg = err?.message || "Failed to assign vaccine";
      setToast({ show: true, type: "error", message: msg });
      setAssigningVaccine(false);
      throw err;
    } finally {
      setAssigningVaccine(false);
    }
  };
  const removeVaccineFromCentre = (vid) => {
    if (!vaccinesModal.centreId) return;
    setCentres((prev) =>
      prev.map((c) =>
        c.id === vaccinesModal.centreId
          ? {
              ...c,
              allowedVaccines: (c.allowedVaccines || []).filter(
                (x) => x !== vid
              ),
            }
          : c
      )
    );
  };

  useEffect(() => {
    async function fetchAssignedAndCatalog() {
      if (!vaccinesModal.open || !vaccinesModal.centreId) return;
      setAssignedLoading(true);
      setAssignedError("");
      setCatalogLoading(true);
      setCatalogError("");
      try {
        const centre = centreById(vaccinesModal.centreId);
        const idParam = centre?.vc_id || centre?.id || vaccinesModal.centreId;
        const [assignedRes, catalogRes] = await Promise.allSettled([
          listAssignedCentreVaccinesByCentre(idParam),
          getVaccines(),
        ]);
        if (assignedRes.status === "fulfilled") {
          const list = Array.isArray(assignedRes.value)
            ? assignedRes.value
            : Array.isArray(assignedRes.value?.data)
            ? assignedRes.value.data
            : assignedRes.value?.data?.data || [];
          const normalized = list.map((a, idx) => ({
            id: a.id ?? a.vaccine_id ?? `row-${idx}`,
            name: a.name ?? a.vaccine_name ?? "Unknown Vaccine",
            description: a.description ?? "",
          }));
          setAssignedVaccines(normalized);
        } else {
          setAssignedError(
            assignedRes.reason?.message || "Failed to load assigned vaccines"
          );
        }
        if (catalogRes.status === "fulfilled") {
          const list = Array.isArray(catalogRes.value)
            ? catalogRes.value
            : Array.isArray(catalogRes.value?.data)
            ? catalogRes.value.data
            : catalogRes.value?.data?.data || [];
          const normalized = list.map((v, idx) => ({
            id: v.id ?? `v-${idx}`,
            name: v.name ?? v.vaccine_name ?? "Unnamed Vaccine",
            description: v.description ?? "",
          }));
          setCatalogVaccines(normalized);
        } else {
          setCatalogError(
            catalogRes.reason?.message || "Failed to load vaccine catalog"
          );
        }
      } finally {
        setAssignedLoading(false);
        setCatalogLoading(false);
      }
    }
    fetchAssignedAndCatalog();
    // Reset when closing
    if (!vaccinesModal.open) {
      setAssignedVaccines([]);
      setAssignedError("");
      setAssignedLoading(false);
      setCatalogVaccines([]);
      setCatalogError("");
      setCatalogLoading(false);
    }
  }, [vaccinesModal.open, vaccinesModal.centreId]);

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#081F2E]/15 text-[#081F2E] ring-1 ring-[#081F2E]/25">
              <FiUsers />
            </div>
            <h2 className="text-xl font-semibold text-[#081F2E]">
              Vaccine Centres
            </h2>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={openAdd}
            className="inline-flex items-center gap-2 rounded-xl bg-[#EAB308] text-[#081F2E] px-3 py-2 text-sm hover:bg-[#d1a207]"
          >
            <FiPlus /> Add Vaccine Centre
          </motion.button>
        </div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
          className="rounded-xl bg-white/70 backdrop-blur-md shadow-sm ring-1 ring-[#081F2E]/10 p-3 flex items-center gap-3"
        >
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#081F2E]/10 text-[#081F2E] ring-1 ring-[#081F2E]/20">
            <FiSearch />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search centres by name..."
            className="flex-1 rounded-md px-3 py-2 bg-[#F8FAFF] text-sm ring-1 ring-[#081F2E]/15 focus:outline-none focus:ring-[#081F2E]/30"
            disabled={loading}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="inline-flex items-center justify-center text-xs px-2.5 py-1.5 rounded-md bg-black/5 text-[#081F2E] hover:bg-black/10"
              aria-label="Clear search"
            >
              Clear
            </button>
          )}
        </motion.div>

        {/* Centres Grid */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
          className="rounded-2xl bg-white/70 backdrop-blur-md shadow-sm ring-1 ring-[#081F2E]/10 p-6"
        >
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, idx) => (
                <motion.div
                  key={`skeleton-${idx}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="rounded-2xl ring-1 ring-[#081F2E]/10 bg-gradient-to-br from-[#F8FAFF] via-white to-[#EFF6FF] p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="h-4 w-40 bg-black/5 rounded-md animate-pulse" />
                    <div className="h-3 w-16 bg-black/5 rounded-md animate-pulse" />
                  </div>
                  <div className="mt-2 h-3 w-60 bg-black/5 rounded-md animate-pulse" />
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {Array.from({ length: 3 }).map((__, i) => (
                      <div
                        key={i}
                        className="h-8 bg-black/5 rounded-md animate-pulse"
                      />
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8">
              <p className="text-sm text-[#0c2b40]/80">{error}</p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={fetchCentres}
                className="inline-flex items-center gap-2 rounded-xl bg-[#EAB308] text-[#081F2E] px-3 py-2 text-sm hover:bg-[#d1a207]"
              >
                Retry
              </motion.button>
            </div>
          ) : filteredCentres.length === 0 ? (
            <div className="text-sm text-[#0c2b40]/70 py-4">
              No centres match your search.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredCentres.map((c, idx) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="rounded-2xl ring-1 ring-[#081F2E]/10 bg-gradient-to-br from-[#F8FAFF] via-white to-[#EFF6FF] p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-semibold text-[#081F2E]">
                        {c.name}
                      </div>
                      <div className="text-xs text-[#0c2b40]/80">
                        {c.address}
                        {c.district ? `, ${c.district}` : ""}
                      </div>
                    </div>
                    <div className="text-xs text-[#0c2b40]/70 font-mono">
                      {c.vc_id || c.id}
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => openMap(c)}
                      className="inline-flex items-center justify-center gap-2 text-xs rounded-md px-3 py-2 bg-[#FFF7E6] text-[#A05A00] ring-1 ring-[#EAB308]/30 hover:bg-[#FDECC8]"
                    >
                      <FiMapPin /> Map
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => openPwd(c)}
                      className="inline-flex items-center justify-center gap-2 text-xs rounded-md px-3 py-2 bg-[#081F2E]/5 text-[#081F2E] ring-1 ring-[#081F2E]/15 hover:bg-[#081F2E]/10"
                    >
                      <FiKey /> Update Password
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => openVaccines(c.id)}
                      className="inline-flex items-center justify-center gap-2 text-xs rounded-md px-3 py-2 bg-[#E9F9EE] text-[#1a8a35] ring-1 ring-[#2FC94E]/30 hover:bg-[#D7F3E2]"
                    >
                      <FiList /> Manage Vaccines
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Map View Modal */}
        <MapModal
          isOpen={mapView.open}
          onClose={closeMap}
          lat={mapView.lat ?? 23.8103}
          lng={mapView.lng ?? 90.4125}
          title={mapView.title}
        />

        {/* Update Password Modal */}
        <AnimatePresence>
          {pwdModal.open && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#081F2E]/40 backdrop-blur-sm flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.98 }}
                transition={{ type: "spring", stiffness: 260, damping: 24 }}
                className="w-[92%] max-w-md rounded-2xl bg-white p-5 ring-1 ring-[#081F2E]/10 shadow-xl"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#081F2E]/10 text-[#081F2E] ring-1 ring-[#081F2E]/20">
                      <FiKey />
                    </div>
                    <h4 className="text-lg font-semibold text-[#081F2E]">
                      Update Password
                    </h4>
                  </div>
                  <button
                    onClick={closePwd}
                    className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-[#081F2E]/5 text-[#081F2E] hover:bg-[#081F2E]/10"
                  >
                    <FiX />
                  </button>
                </div>
                <div className="text-xs text-[#0c2b40]/80 mb-3">
                  Centre:{" "}
                  <span className="font-semibold text-[#081F2E]">
                    {pwdModal.centre?.name}
                  </span>{" "}
                  (<span className="font-mono">{pwdModal.centre?.id}</span>)
                </div>
                <div>
                  <label className="text-xs text-[#0c2b40]/70">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={pwdModal.pwd}
                    onChange={(e) =>
                      setPwdModal((s) => ({ ...s, pwd: e.target.value }))
                    }
                    placeholder="••••••••"
                    className="mt-1 w-full rounded-md px-3 py-2 ring-1 ring-[#081F2E]/15 bg-[#F8FAFF] focus:outline-none focus:ring-[#081F2E]/30 text-sm"
                  />
                </div>
                <div className="mt-4 flex items-center justify-end gap-2">
                  <button
                    onClick={closePwd}
                    className="text-xs px-3 py-2 rounded-md bg-[#081F2E]/5 text-[#081F2E] ring-1 ring-[#081F2E]/15 hover:bg-[#081F2E]/10"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={confirmPwd}
                    disabled={pwdUpdating || !(pwdModal.pwd || "").trim()}
                    className={`text-xs px-3 py-2 rounded-md shadow-sm ${
                      pwdUpdating
                        ? "bg-[#2FC94E]/60 text-white cursor-not-allowed"
                        : "bg-[#2FC94E] text-white hover:bg-[#28b745]"
                    }`}
                  >
                    {pwdUpdating ? "Saving..." : "Save"}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Centre Modal */}
        <AnimatePresence>
          {addOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#081F2E]/40 backdrop-blur-sm flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.98 }}
                transition={{ type: "spring", stiffness: 260, damping: 24 }}
                className="w-[94%] max-w-3xl h-[85vh] overflow-y-auto rounded-2xl bg-white p-5 ring-1 ring-[#081F2E]/10 shadow-xl"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAB308]/10 text-[#EAB308] ring-1 ring-[#EAB308]/20">
                      <FiPlus />
                    </div>
                    <h4 className="text-lg font-semibold text-[#081F2E]">
                      Add Vaccine Centre
                    </h4>
                  </div>
                  <button
                    onClick={closeAdd}
                    className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-[#081F2E]/5 text-[#081F2E] hover:bg-[#081F2E]/10"
                  >
                    <FiX />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div>
                    <label className="text-xs text-[#0c2b40]/70">Name</label>
                    <input
                      type="text"
                      value={newCentre.name}
                      onChange={(e) =>
                        setNewCentre((s) => ({ ...s, name: e.target.value }))
                      }
                      placeholder="e.g., Banani Health Centre"
                      className="mt-1 w-full rounded-md px-3 py-2 ring-1 ring-[#081F2E]/15 bg-[#F8FAFF] focus:outline-none focus:ring-[#081F2E]/30 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#0c2b40]/70">ID</label>
                    <input
                      type="text"
                      value={newCentre.id}
                      onChange={(e) =>
                        setNewCentre((s) => ({ ...s, id: e.target.value }))
                      }
                      placeholder="optional, auto-generated if empty"
                      className="mt-1 w-full rounded-md px-3 py-2 ring-1 ring-[#081F2E]/15 bg-[#F8FAFF] focus:outline-none focus:ring-[#081F2E]/30 text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs text-[#0c2b40]/70">Address</label>
                    <input
                      type="text"
                      value={newCentre.address}
                      onChange={(e) =>
                        setNewCentre((s) => ({ ...s, address: e.target.value }))
                      }
                      placeholder="Full address"
                      className="mt-1 w-full rounded-md px-3 py-2 ring-1 ring-[#081F2E]/15 bg-[#F8FAFF] focus:outline-none focus:ring-[#081F2E]/30 text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs text-[#0c2b40]/70">
                      District
                    </label>
                    <input
                      type="text"
                      value={newCentre.district}
                      onChange={(e) =>
                        setNewCentre((s) => ({
                          ...s,
                          district: e.target.value,
                        }))
                      }
                      placeholder="e.g., Dhaka"
                      className="mt-1 w-full rounded-md px-3 py-2 ring-1 ring-[#081F2E]/15 bg-[#F8FAFF] focus:outline-none focus:ring-[#081F2E]/30 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#0c2b40]/70">
                      Password
                    </label>
                    <input
                      type="password"
                      value={newCentre.password}
                      onChange={(e) =>
                        setNewCentre((s) => ({
                          ...s,
                          password: e.target.value,
                        }))
                      }
                      placeholder="••••••••"
                      className="mt-1 w-full rounded-md px-3 py-2 ring-1 ring-[#081F2E]/15 bg-[#F8FAFF] focus:outline-none focus:ring-[#081F2E]/30 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#0c2b40]/70">
                      Latitude / Longitude
                    </label>
                    <div className="mt-1 grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        step="any"
                        value={newCentre.lat}
                        onChange={(e) =>
                          setNewCentre((s) => ({
                            ...s,
                            lat: parseFloat(e.target.value || "0"),
                          }))
                        }
                        className="w-full rounded-md px-3 py-2 ring-1 ring-[#081F2E]/15 bg-[#F8FAFF] focus:outline-none focus:ring-[#081F2E]/30 text-sm"
                        placeholder="Latitude"
                      />
                      <input
                        type="number"
                        step="any"
                        value={newCentre.lng}
                        onChange={(e) =>
                          setNewCentre((s) => ({
                            ...s,
                            lng: parseFloat(e.target.value || "0"),
                          }))
                        }
                        className="w-full rounded-md px-3 py-2 ring-1 ring-[#081F2E]/15 bg-[#F8FAFF] focus:outline-none focus:ring-[#081F2E]/30 text-sm"
                        placeholder="Longitude"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-xs text-[#0c2b40]/70 mb-2">
                    Select location on map; coordinates will fill automatically.
                  </div>
                  <GoogleMap
                    markers={
                      newCentre.lat && newCentre.lng
                        ? [
                            {
                              id: "new",
                              lat: newCentre.lat,
                              lng: newCentre.lng,
                              title: newCentre.name || "Selected",
                            },
                          ]
                        : []
                    }
                    activeId={"new"}
                    showAll={false}
                    onMapClick={({ lat, lng }) =>
                      setNewCentre((s) => ({ ...s, lat, lng }))
                    }
                    height={320}
                  />
                </div>

                <div className="mt-4 flex items-center justify-end gap-2">
                  <button
                    onClick={closeAdd}
                    className="text-xs px-3 py-2 rounded-md bg-[#081F2E]/5 text-[#081F2E] ring-1 ring-[#081F2E]/15 hover:bg-[#081F2E]/10"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={confirmAdd}
                    disabled={adding}
                    className={`text-xs px-3 py-2 rounded-md ${
                      adding
                        ? "bg-[#081F2E]/10 text-[#081F2E]/50 cursor-not-allowed"
                        : "bg-[#EAB308] text-[#081F2E] hover:bg-[#d1a207]"
                    }`}
                  >
                    {adding ? "Adding..." : "Add Centre"}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Manage Vaccines Modal */}
        <AnimatePresence>
          {vaccinesModal.open && vaccinesModal.centreId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#081F2E]/40 backdrop-blur-sm flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.98 }}
                transition={{ type: "spring", stiffness: 260, damping: 24 }}
                className="w-[94%] max-w-2xl h-[85vh] overflow-y-auto rounded-2xl bg-white p-5 ring-1 ring-[#081F2E]/10 shadow-xl"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#081F2E]/10 text-[#081F2E] ring-1 ring-[#081F2E]/20">
                      <FiList />
                    </div>
                    <h4 className="text-lg font-semibold text-[#081F2E]">
                      Assigned Vaccines
                    </h4>
                  </div>
                  <button
                    onClick={closeVaccines}
                    className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-[#081F2E]/5 text-[#081F2E] hover:bg-[#081F2E]/10"
                  >
                    <FiX />
                  </button>
                </div>

                <div className="text-xs text-[#0c2b40]/80 mb-3">
                  Centre:{" "}
                  <span className="font-semibold text-[#081F2E]">
                    {centreById(vaccinesModal.centreId)?.name}
                  </span>{" "}
                  (<span className="font-mono">{vaccinesModal.centreId}</span>)
                </div>

                {/* Assigned vaccines */}
                <div className="rounded-xl ring-1 ring-[#081F2E]/10 bg-[#F8FAFF] p-3">
                  <div className="text-xs text-[#0c2b40]/70 mb-2">
                    Available at this centre
                  </div>
                  {assignedLoading ? (
                    <div className="h-[120px] grid place-items-center">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 240,
                          damping: 20,
                        }}
                        className="flex flex-col items-center gap-3"
                      >
                        <div className="h-8 w-8 rounded-full border-2 border-[#081F2E] border-t-transparent animate-spin" />
                        <div className="text-xs text-[#0c2b40]/70">
                          Loading assigned vaccines...
                        </div>
                      </motion.div>
                    </div>
                  ) : assignedError ? (
                    <div className="text-xs text-[#F04E36]">
                      {assignedError}
                    </div>
                  ) : assignedVaccines.length > 0 ? (
                    <div className="space-y-2">
                      <AnimatePresence initial={false}>
                        {assignedVaccines.map((v, idx) => (
                          <motion.div
                            key={v.id ?? `row-${idx}`}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 6 }}
                            className="rounded-md ring-1 ring-[#081F2E]/10 bg-white p-2.5"
                          >
                            <div className="text-sm font-medium text-[#081F2E]">
                              {v.name}
                            </div>
                            {v.description && (
                              <div className="text-xs text-[#0c2b40]/70">
                                {v.description}
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <div className="text-xs text-[#0c2b40]/60">
                      No vaccines assigned yet.
                    </div>
                  )}
                </div>

                {/* Add new vaccine */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
                  <div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-[#0c2b40]/70">
                        Add vaccine not in centre
                      </label>
                      {catalogLoading && (
                        <div className="h-3 w-3 rounded-full border-2 border-[#081F2E] border-t-transparent animate-spin" />
                      )}
                    </div>
                    {catalogError && (
                      <div className="mt-1 text-[11px] text-[#F04E36]">
                        {catalogError}
                      </div>
                    )}
                    <select
                      value={vaccinesModal.selectedId}
                      onChange={(e) =>
                        setVaccinesModal((s) => ({
                          ...s,
                          selectedId: e.target.value,
                        }))
                      }
                      disabled={catalogLoading}
                      className={`mt-1 w-full rounded-md px-3 py-2 ring-1 ring-[#081F2E]/15 bg-white focus:outline-none focus:ring-[#081F2E]/30 text-sm ${
                        catalogLoading ? "opacity-60 cursor-not-allowed" : ""
                      }`}
                    >
                      {catalogLoading ? (
                        <option value="" disabled>
                          Loading vaccines…
                        </option>
                      ) : catalogError ? (
                        <option value="" disabled>
                          Failed to load vaccines
                        </option>
                      ) : notAddedOptions.length === 0 ? (
                        <option value="" disabled>
                          All vaccines already assigned
                        </option>
                      ) : (
                        <>
                          <option value="">Select a vaccine</option>
                          {notAddedOptions.map((v) => (
                            <option key={v.id} value={v.id}>
                              {v.name}
                            </option>
                          ))}
                        </>
                      )}
                    </select>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={addVaccineToCentre}
                    disabled={
                      catalogLoading ||
                      !vaccinesModal.selectedId ||
                      assigningVaccine
                    }
                    className={`h-[38px] md:h-[36px] inline-flex items-center justify-center gap-2 text-xs rounded-md px-3 py-2 ${
                      catalogLoading ||
                      !vaccinesModal.selectedId ||
                      assigningVaccine
                        ? "bg-[#081F2E]/10 text-[#081F2E]/50 cursor-not-allowed"
                        : "bg-[#EAB308] text-[#081F2E] hover:bg-[#d1a207]"
                    }`}
                  >
                    {assigningVaccine ? (
                      <>
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{
                            type: "spring",
                            stiffness: 240,
                            damping: 20,
                          }}
                          className="h-3 w-3 rounded-full border-2 border-[#081F2E] border-t-transparent animate-spin"
                        />
                        Adding...
                      </>
                    ) : (
                      <>
                        <FiPlus /> Add Vaccine
                      </>
                    )}
                  </motion.button>
                </div>

                <div className="mt-4 flex items-center justify-end">
                  <button
                    onClick={closeVaccines}
                    className="text-xs px-3 py-2 rounded-md bg-[#081F2E]/5 text-[#081F2E] ring-1 ring-[#081F2E]/15 hover:bg-[#081F2E]/10"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>
      <Notification
        show={toast.show}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast((t) => ({ ...t, show: false }))}
      />
    </>
  );
};

export default AuthorityCentres;
