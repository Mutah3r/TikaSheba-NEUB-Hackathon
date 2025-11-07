import api from "./apiClient";

export function getTodaysScheduledByCentre(centre_id) {
  return api.get(`/appointment/centre/${centre_id}/status/scheduled/date/today`);
}

export default { getTodaysScheduledByCentre };