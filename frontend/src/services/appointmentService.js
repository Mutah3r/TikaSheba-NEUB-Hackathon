import api from "./apiClient";

export function getTodaysScheduledByCentre(centre_id) {
  return api.get(`/appointment/centre/${centre_id}/status/scheduled/date/today`);
}

export function getCentreCapacityNext30(centre_id) {
  return api.get(`/capacity/available/centre/${centre_id}/next30`);
}

export function createAppointment({ citizen_id, vaccine_id, vaccine_name, center_id, date, time }) {
  return api.post(`/appointment`, {
    citizen_id,
    vaccine_id,
    vaccine_name,
    center_id,
    date,
    time,
  });
}

export function getAppointmentsByCitizen(citizen_id) {
  return api.get(`/appointment/citizen/${citizen_id}`);
}

export default { getTodaysScheduledByCentre, getCentreCapacityNext30, createAppointment, getAppointmentsByCitizen };