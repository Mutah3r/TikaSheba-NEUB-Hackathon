import axios from "axios";

const ai = axios.create({
  baseURL: "http://localhost:5000",
  headers: { "Content-Type": "application/json" },
});

export async function askGuidance(prompt) {
  const res = await ai.post("/chat", { message: prompt });
  return res.data;
}

export default { askGuidance };
