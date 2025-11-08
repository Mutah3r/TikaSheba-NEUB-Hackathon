import api from "./apiClient";

// Get notifications for current authorized user (authority token required)
export function getNotifications() {
  return api.get(`/notification`);
}

export default { getNotifications };