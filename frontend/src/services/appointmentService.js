import api from "./apiClient";

export function getTodaysScheduledByCentre(centre_id) {
  return api.get(`/appointment/centre/${centre_id}/status/scheduled/date/today`);
}

export function getCentreCapacityNext30(centre_id) {
  return api.get(`/capacity/available/centre/${centre_id}/next30`);
}

export default { getTodaysScheduledByCentre, getCentreCapacityNext30 };