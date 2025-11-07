import api from "./apiClient";

// Weekly served counts for current centre user (derived from token vc_id)
export function getWeeklyServed() {
  return api.get(`/graph/centre/served/last-7-days`);
}

// Centre appointment logs: citizen_name, vaccine_name, date, status
export function getCentreLogs(params = {}) {
  return api.get(`/graph/centre/logs`, { params });
}

export default { getWeeklyServed, getCentreLogs };