import api from "./api";

// Engine endpoints (preview only, nothing is saved)
export const previewAnalysis = (data) => api.post("/analyses/analyze", data);
export const previewSampleAnalysis = (sampleId) => api.post("/analyses/analyze-sample", { sampleId });
export const getSampleSignals = () => api.get("/analyses/samples");

// CRUD endpoints (saved in MongoDB)
export const getAnalyses = (params) => api.get("/analyses", { params });
export const getAnalysis = (id) => api.get(`/analyses/${id}`);
export const createAnalysis = (data) => api.post("/analyses", data);
export const updateAnalysis = (id, data) => api.put(`/analyses/${id}`, data);
export const deleteAnalysis = (id) => api.delete(`/analyses/${id}`);
