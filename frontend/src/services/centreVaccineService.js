import api from "./apiClient";

export function listAssignedCentreVaccines() {
  return api.get(`/centre_vaccine/assigned`);
}

export default { listAssignedCentreVaccines };