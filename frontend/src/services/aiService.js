import axios from "axios";

const ai = axios.create({
  baseURL: "http://localhost:5000",
  headers: { "Content-Type": "application/json" },
});

export async function askGuidance(prompt) {
  const res = await ai.post("/chat", { message: prompt });
  return res.data;
}

export async function getWasteForecast({
  centre_vaccine_id,
  days_to_forecast,
  auth_token,
}) {
  const res = await ai.post("/forecast_waste", {
    centre_vaccine_id: "690e473c078a4481e3c69863",
    days_to_forecast: days_to_forecast,
    auth_token: auth_token,
  });
  return res.data;
}

export async function getDemandForecast({
  centre_vaccine_id,
  days_to_forecast,
  auth_token,
}) {
  const res = await ai.post("/forecast_demand", {
    centre_vaccine_id: "690e473c078a4481e3c69863",
    days_to_forecast: days_to_forecast,
    auth_token: auth_token,
  });
  return res.data;
}

export default { askGuidance, getWasteForecast, getDemandForecast };
