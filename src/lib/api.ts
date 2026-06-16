const API_BASE_URL = "http://localhost:8000/api/v1";

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("adminToken");
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

export const api = {
  // Analysis endpoints
  async analyzeSpeech(request: {
    transcript: string;
    native_language: string;
    english_level: string;
    target_band: string;
    practice_mode: string;
    question?: string;
  }) {
    const res = await fetch(`${API_BASE_URL}/analysis/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
    if (!res.ok) throw new Error("Failed to analyze");
    return res.json();
  },

  // Progress endpoints
  async listUsers() {
    const res = await fetch(`${API_BASE_URL}/progress/users`);
    if (!res.ok) throw new Error("Failed to list users");
    return res.json();
  },

  async getUserProgress(telegramId: number) {
    const res = await fetch(`${API_BASE_URL}/progress/user/${telegramId}`);
    if (!res.ok) throw new Error("Failed to get progress");
    return res.json();
  },

  async getWebAppProgress(initData: string) {
    const res = await fetch(`${API_BASE_URL}/progress/webapp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ init_data: initData }),
    });
    if (!res.ok) throw new Error("Failed to get webapp progress");
    return res.json();
  },

  async getProgressByPhone(phoneNumber: string) {
    const res = await fetch(`${API_BASE_URL}/progress/by-phone`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone_number: phoneNumber }),
    });
    if (!res.ok) throw new Error("Failed to get progress");
    return res.json();
  },

  // Admin endpoints
  async getAdminUsers() {
    const res = await fetch(`${API_BASE_URL}/admin/users`, {
      headers: { ...getAuthHeaders() },
    });
    if (!res.ok) throw new Error("Failed to get users");
    return res.json();
  },

  async getAdminSessions() {
    const res = await fetch(`${API_BASE_URL}/admin/sessions`, {
      headers: { ...getAuthHeaders() },
    });
    if (!res.ok) throw new Error("Failed to get sessions");
    return res.json();
  },

  async getAdminResults() {
    const res = await fetch(`${API_BASE_URL}/admin/results`, {
      headers: { ...getAuthHeaders() },
    });
    if (!res.ok) throw new Error("Failed to get results");
    return res.json();
  },

  async getAdminStats() {
    const res = await fetch(`${API_BASE_URL}/admin/stats`, {
      headers: { ...getAuthHeaders() },
    });
    if (!res.ok) throw new Error("Failed to get stats");
    return res.json();
  },
};
