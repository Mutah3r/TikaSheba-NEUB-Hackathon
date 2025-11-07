import api from "./apiClient";

export function listAssignedCentreVaccines() {
  return api.get(`/centre_vaccine/assigned`);
}

export function listAssignedCentreVaccinesByCentre(id) {
  return api.get(`/centre_vaccine/assigned/${id}`);
}

export function assignVaccineToCentre({ centre_id, vaccine_id, vaccine_name }) {
  return api.post(`/centre_vaccine`, { centre_id, vaccine_id, vaccine_name });
}

export default { listAssignedCentreVaccines, listAssignedCentreVaccinesByCentre, assignVaccineToCentre };