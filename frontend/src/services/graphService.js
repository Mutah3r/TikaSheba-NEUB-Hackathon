import api from "./apiClient";

// Weekly served counts for current centre user (derived from token vc_id)
export function getWeeklyServed() {
  return api.get(`/graph/centre/served/last-7-days`);
}

export default { getWeeklyServed };