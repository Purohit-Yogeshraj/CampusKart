const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";
const SERVER_BASE_URL = API_BASE_URL.replace(/\/api$/, "");

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

export { API_BASE_URL, SERVER_BASE_URL, request };
