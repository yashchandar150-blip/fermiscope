import api from "./api";

export const getHypotheses = (params) => api.get("/hypotheses", { params });
export const getHypothesis = (id) => api.get(`/hypotheses/${id}`);
export const saveHypothesisNote = (id, note) => api.put(`/hypotheses/${id}/note`, { note });
