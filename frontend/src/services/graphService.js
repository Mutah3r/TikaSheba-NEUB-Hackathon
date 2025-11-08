import api from "./apiClient";

// Weekly served counts for current centre user (derived from token vc_id)
export function getWeeklyServed() {
  return api.get(`/graph/centre/served/last-7-days`);
}

// Centre appointment logs: citizen_name, vaccine_name, date, status
export function getCentreLogs(params = {}) {
  return api.get(`/graph/centre/logs`, { params });
}

// Citizen: generate vaccine card QR and payload (requires Authorization token)
export function generateCitizenVaccineCard() {
  return api.post(`/graph/citizen/vaccine-card/generate`);
}

export default { getWeeklyServed, getCentreLogs, generateCitizenVaccineCard };