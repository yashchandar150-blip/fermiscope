import api from "./api";

export const getObservations = (params) => api.get("/observations", { params });
export const getObservation = (id) => api.get(`/observations/${id}`);
export const createObservation = (data) => api.post("/observations", data);
export const updateObservation = (id, data) => api.put(`/observations/${id}`, data);
export const deleteObservation = (id) => api.delete(`/observations/${id}`);
