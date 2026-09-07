import { simulateDelay } from "./apiClient";
import { patients } from "../data/mockData";
import { DASHBOARD_ROUTES } from "../constants";

// NOTE: This is mock authentication. Later, replace with a Spring Boot
// JWT login endpoint that returns { token, user }.

const MOCK_CREDENTIALS = [
  { email: "patient@meditrack.com", password: "password", role: "patient" },
  { email: "doctor@meditrack.com", password: "password", role: "doctor" },
  { email: "admin@meditrack.com", password: "password", role: "admin" },
];

export function login({ email, password, role }) {
  const match = MOCK_CREDENTIALS.find(
    (c) => c.email === email && c.password === password && c.role === role
  );
  if (!match) {
    return simulateDelay(
      { success: false, message: "Invalid email, password or role." },
      400
    );
  }

  let user;
  if (role === "patient") {
    const p = patients[0];
    user = { id: p.id, name: p.name, email: p.email, role: "patient", avatar: p.name };
  } else if (role === "doctor") {
    user = {
      id: "D-201",
      name: "Dr. Sneha Menon",
      email: "doctor@meditrack.com",
      role: "doctor",
    };
  } else {
    user = { id: "ADM-1", name: "Admin User", email: "admin@meditrack.com", role: "admin" };
  }

  return simulateDelay({
    success: true,
    token: "mock-jwt-token-" + Date.now(),
    user,
    redirectTo: DASHBOARD_ROUTES[role],
  });
}

export function register(payload) {
  // later: POST /api/auth/register
  return simulateDelay(
    { success: true, message: "Registration successful. Please log in." },
    500
  );
}

export function logout() {
  // later: client clears token + optional POST /api/auth/logout
  return simulateDelay({ success: true }, 150);
}
