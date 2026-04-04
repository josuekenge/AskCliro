// API and WebSocket services

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

class ApiError extends Error {
  status: number;
  detail: string;
  constructor(status: number, detail: string) {
    super(detail);
    this.status = status;
    this.detail = detail;
  }
}

async function handleResponse(response: Response) {
  const data = await response.json();
  if (!response.ok) {
    throw new ApiError(response.status, data.detail || 'Something went wrong');
  }
  return data;
}

export const api = {
  async get(endpoint: string) {
    const response = await fetch(`${API_URL}${endpoint}`);
    return handleResponse(response);
  },

  async post(endpoint: string, data?: any) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: data ? JSON.stringify(data) : undefined,
    });
    return handleResponse(response);
  },

  async patch(endpoint: string, data: any) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
};

// Sessions API
export const sessionsApi = {
  create: (data: {
    patient_name: string;
    patient_age?: number;
    patient_sex?: string;
    chief_complaint: string;
    allergies?: string[];
    conditions?: string[];
    medications?: string[];
  }) => api.post('/api/sessions', data),

  list: (params?: { status?: string; patient_id?: string }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.patient_id) query.set('patient_id', params.patient_id);
    const qs = query.toString();
    return api.get(`/api/sessions${qs ? `?${qs}` : ''}`);
  },

  get: (id: string) => api.get(`/api/sessions/${id}`),

  getActive: () => api.get('/api/sessions/active'),

  update: (id: string, data: { chief_complaint?: string; soap_note?: any; soap_status?: any }) =>
    api.patch(`/api/sessions/${id}`, data),

  end: (id: string) => api.post(`/api/sessions/${id}/end`),
};

// Patients API
export const patientsApi = {
  list: () => api.get('/api/patients'),
  get: (id: string) => api.get(`/api/patients/${id}`),
  update: (id: string, data: any) => api.patch(`/api/patients/${id}`, data),
};

export const wsService = {
  connect(sessionId: string) {
    const wsUrl = `${API_URL.replace('http', 'ws')}/ws/session/${sessionId}`;
    return new WebSocket(wsUrl);
  },
};

export { ApiError };
