export type Application = {
  id: number;
  company: string;
  role: string;
  status: string;
  location?: string | null;
  job_url?: string | null;
  notes?: string | null;
};

const API_BASE = import.meta.env.VITE_API_BASE;

export async function fetchApplications(
  token: string,
  filters?: { status?: string; company?: string }
) {
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status);
  if (filters?.company) params.set("company", filters.company);

  const res = await fetch(
    `${API_BASE}/api/applications/?${params.toString()}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!res.ok) throw new Error("Failed to fetch applications");
  return res.json() as Promise<Application[]>;
}

export async function createApplication(
  token: string,
  input: Omit<Application, "id">
) {
  const res = await fetch(`${API_BASE}/api/applications/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to create application");
  return res.json() as Promise<Application>;
}

export async function updateApplication(
  token: string,
  id: number,
  patch: Partial<Omit<Application, "id">>
) {
  const res = await fetch(`${API_BASE}/api/applications/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error("Failed to update application");
  return res.json() as Promise<Application>;
}

export async function deleteApplication(token: string, id: number) {
  const res = await fetch(`${API_BASE}/api/applications/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to delete application");
  return res.json();
}
