import api from "./apiClient";

export function centreLogin({ vc_id, password }) {
  return api.post("/vacc_centre/login", { vc_id, password });
}

export default { centreLogin };