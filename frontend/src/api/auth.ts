const API_BASE = import.meta.env.VITE_API_BASE;

export async function login(email: string, password: string) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) throw new Error("Invalid login");
  return res.json() as Promise<{ access_token: string; token_type: string }>;
}
