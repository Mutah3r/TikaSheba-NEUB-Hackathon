import api from "./apiClient";

export function authorityLogin({ email, password }) {
  return api.post("/authority/login", { email, password });
}

export default { authorityLogin };