import api from "./apiClient";

export function getCentreOverview(centre_id) {
  return api.get(`/vaccine/centre/${centre_id}/overview`);
}

export function listVaccines() {
  return api.get(`/centre_vaccine/assigned`);
}

export default { getCentreOverview, listVaccines };