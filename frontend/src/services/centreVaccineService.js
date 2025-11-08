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

export function getAvailableCentresByVaccine(vaccineId) {
  return api.get(`/centre_vaccine/available/${vaccineId}`);
}

// Put request to request stock for a centre-vaccine entry
export function requestCentreVaccineStock(id, requested_stock_amount) {
  return api.put(`/centre_vaccine/${id}/request`, { requested_stock_amount });
}

// Put request to add or adjust stock for a centre-vaccine entry
export function updateCentreVaccineStock(id, amount) {
  return api.put(`/centre_vaccine/${id}/stock`, { operation: "add", amount });
}

// Authority: list all requested centre vaccine stocks
export function listRequestedCentreVaccines() {
  return api.get(`/centre_vaccine/requested`);
}

// Authority: update requested status for a centre-vaccine record
export function updateCentreVaccineStatus(id, status) {
  return api.put(`/centre_vaccine/${id}/status`, { status });
}

export default {
  listAssignedCentreVaccines,
  listAssignedCentreVaccinesByCentre,
  assignVaccineToCentre,
  getAvailableCentresByVaccine,
  requestCentreVaccineStock,
  updateCentreVaccineStock,
  listRequestedCentreVaccines,
  updateCentreVaccineStatus,
};