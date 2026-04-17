// Force the app to use the Vite proxy (which safely routes to port 5002)
const API_BASE_URL = "/api";
const SERVER_BASE_URL = API_BASE_URL.replace(/\/api$/, "");

async function request(path, options = {}) {
  // 1. Grab the token from Local Storage
  const token =
    localStorage.getItem("token") || localStorage.getItem("campuskart_token");
  const headers = { ...options.headers };

  // 2. Attach it to the Authorization header if it exists
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    ...options,
    headers,
  });

  let data;
  try {
    data = await response.json();
  } catch (error) {
    data = null;
  }

  if (!response.ok) {
    const message =
      data?.message || `${response.status} ${response.statusText}`;
    throw new Error(message);
  }

  return data;
}

export { API_BASE_URL, SERVER_BASE_URL, request };
