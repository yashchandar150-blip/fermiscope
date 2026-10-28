// Small helper functions used by many pages

export const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

export const formatDateTime = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Value for <input type="date">  ->  "2026-10-25"
export const toInputDate = (value) => {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
};

export const formatNumber = (value, unit = "") => {
  if (value === null || value === undefined || value === "") return "-";
  return `${Number(value).toLocaleString("en-US", { maximumFractionDigits: 3 })}${unit ? " " + unit : ""}`;
};

// Turns an Axios error into a readable message
export const getErrorMessage = (error) => {
  if (error.response && error.response.data && error.response.data.message) {
    return error.response.data.message;
  }
  if (error.code === "ERR_NETWORK") return "Cannot reach the server. Is the backend running?";
  return error.message || "Something went wrong";
};

// Saves a file received from the API (used for the PDF export)
export const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

// Removes empty strings so optional fields are not sent as ""
// Numbers listed in numberFields are converted from text to numbers.
export const cleanPayload = (form, numberFields = []) => {
  const data = {};
  Object.entries(form).forEach(([key, value]) => {
    if (value === "" || value === null || value === undefined) return;
    data[key] = numberFields.includes(key) ? Number(value) : value;
  });
  return data;
};
