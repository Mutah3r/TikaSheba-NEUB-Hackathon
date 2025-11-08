import api from "./apiClient";

export function getCentreOverview(centre_id) {
  return api.get(`/vaccine/centre/${centre_id}/overview`);
}

export function listVaccines() {
  return api.get(`/centre_vaccine/assigned`);
}

export function getCitizenLogs(citizen_id) {
  return api.get(`/vaccine/log/citizen/${citizen_id}`);
}

export default { getCentreOverview, listVaccines, getCitizenLogs };