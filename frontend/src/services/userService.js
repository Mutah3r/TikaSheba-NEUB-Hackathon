import api from "./apiClient";

export function getCurrentUser() {
  return api.get("/global/user");
}

export default { getCurrentUser };