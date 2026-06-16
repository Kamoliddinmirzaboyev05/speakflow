
const API_BASE_URL = "http://localhost:8000/api/v1";

export const api = {
  // Analysis endpoints
  async analyzeSpeech(request: {
    transcript: string;
    native_language: string;
    english_level: string;
    target_band: string;
    practice_mode: string;
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

  // Admin endpoints
  async getAdminUsers() {
    const res = await fetch(`${API_BASE_URL}/admin/users`);
    if (!res.ok) throw new Error("Failed to get users");
    return res.json();
  },

  async getAdminSessions() {
    const res = await fetch(`${API_BASE_URL}/admin/sessions`);
    if (!res.ok) throw new Error("Failed to get sessions");
    return res.json();
  },

  async getAdminResults() {
    const res = await fetch(`${API_BASE_URL}/admin/results`);
    if (!res.ok) throw new Error("Failed to get results");
    return res.json();
  },

  async getAdminStats() {
    const res = await fetch(`${API_BASE_URL}/admin/stats`);
    if (!res.ok) throw new Error("Failed to get stats");
    return res.json();
  },
};
