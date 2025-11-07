import api from "./apiClient";

export function centreLogin({ vc_id, password }) {
  return api.post("/vacc_centre/login", { vc_id, password });
}

export function getVaccineCentres() {
  return api.get("/vacc_centre");
}

export function registerVaccineCentre({ name, location, district, lattitude, longitude, vc_id, password }) {
  return api.post("/vacc_centre/register", {
    name,
    location,
    district,
    lattitude,
    longitude,
    vc_id,
    password,
  });
}

export function updateVaccineCentre(id, { name, location, district, lattitude, longitude, password }) {
  return api.put(`/vacc_centre/${id}`, {
    name,
    location,
    district,
    lattitude,
    longitude,
    password,
  });
}

export default { centreLogin, getVaccineCentres, registerVaccineCentre, updateVaccineCentre };