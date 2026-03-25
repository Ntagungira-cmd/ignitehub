import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('ignitehub-auth');
    if (raw) {
      try {
        const { state } = JSON.parse(raw) as { state: { token: string | null } };
        if (state?.token) {
          config.headers.Authorization = `Bearer ${state.token}`;
        }
      } catch {
        // ignore malformed storage
      }
    }
  }
  return config;
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserRole = 'student' | 'mentor' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  avatarUrl?: string;
  skills?: string[];
  bio?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export type ProjectStatus = 'draft' | 'active' | 'completed' | 'archived';

export interface Project {
  id: string;
  title: string;
  abstract: string;
  tags?: string[];
  status: ProjectStatus;
  ownerId: string;
  owner?: User;
  createdAt: string;
  updatedAt: string;
}

export type MatchType = 'mentor' | 'collaborator';
export type MatchStatus = 'pending' | 'accepted' | 'rejected';

export interface Match {
  id: string;
  type: MatchType;
  score: number;
  matchingTags?: string[];
  status: MatchStatus;
  studentId: string;
  student?: User;
  matchedUserId: string;
  matchedUser?: User;
  createdAt: string;
}

export interface MatchRecommendation {
  mentor: User;
  score: number;
  matchingTags: string[];
}

export type SessionStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Session {
  id: string;
  scheduledAt: string;
  durationMinutes: number;
  googleCalendarEventId?: string;
  status: SessionStatus;
  notes?: string;
  mentorId: string;
  mentor?: User;
  studentId: string;
  student?: User;
  projectId?: string;
  project?: Project;
  createdAt: string;
}

export type ResourceCategory = 'template' | 'workshop' | 'invention' | 'article';

export interface Resource {
  id: string;
  title: string;
  description?: string;
  category: ResourceCategory;
  fileUrl?: string;
  tags?: string[];
  authorId: string;
  author?: User;
  createdAt: string;
}

export type CardPriority = 'low' | 'medium' | 'high' | 'critical';

export interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  priority: CardPriority;
  dueDate?: string;
  columnId: string;
  assigneeId?: string;
  assignee?: User;
  createdAt: string;
  updatedAt: string;
}

export interface KanbanColumn {
  id: string;
  title: string;
  position: number;
  workspaceId: string;
  cards: KanbanCard[];
}

export interface Workspace {
  id: string;
  name: string;
  projectId: string;
  project?: Project;
  columns: KanbanColumn[];
  createdAt: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  register: (data: { email: string; password: string; fullName: string; role: UserRole }) =>
    api.post<AuthResponse>('/auth/register', data).then((r) => r.data),
  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data).then((r) => r.data),
  me: () => api.get<User>('/auth/me').then((r) => r.data),
};

// ─── Users ────────────────────────────────────────────────────────────────────

export const usersApi = {
  list: (query?: { role?: UserRole; page?: number; limit?: number }) =>
    api.get<PaginatedResponse<User>>('/users', { params: query }).then((r) => r.data.data),
  getProfile: () => api.get<User>('/users/profile').then((r) => r.data),
  updateProfile: (data: { fullName?: string; avatarUrl?: string; skills?: string[]; bio?: string }) =>
    api.patch<User>('/users/profile', data).then((r) => r.data),
  getById: (id: string) => api.get<User>(`/users/${id}`).then((r) => r.data),
};

// ─── Projects ─────────────────────────────────────────────────────────────────

export const projectsApi = {
  create: (data: { title: string; abstract: string; tags?: string[] }) =>
    api.post<Project>('/projects', data).then((r) => r.data),
  list: (query?: { tags?: string; status?: ProjectStatus; page?: number; limit?: number }) =>
    api.get<PaginatedResponse<Project>>('/projects', { params: query }).then((r) => r.data.data),
  getById: (id: string) => api.get<Project>(`/projects/${id}`).then((r) => r.data),
  update: (id: string, data: Partial<{ title: string; abstract: string; tags: string[]; status: ProjectStatus }>) =>
    api.patch<Project>(`/projects/${id}`, data).then((r) => r.data),
  remove: (id: string) => api.delete(`/projects/${id}`).then((r) => r.data),
};

// ─── Matches ──────────────────────────────────────────────────────────────────

export const matchesApi = {
  recommendations: () => api.get<MatchRecommendation[]>('/matches/recommendations').then((r) => r.data),
  myMatches: () => api.get<Match[]>('/matches').then((r) => r.data),
  request: (userId: string, data: { type: MatchType }) =>
    api.post<Match>(`/matches/request/${userId}`, data).then((r) => r.data),
  updateStatus: (matchId: string, data: { status: 'accepted' | 'rejected' }) =>
    api.patch<Match>(`/matches/${matchId}/status`, data).then((r) => r.data),
};

// ─── Sessions ─────────────────────────────────────────────────────────────────

export const sessionsApi = {
  create: (data: { mentorId: string; scheduledAt: string; durationMinutes?: number; notes?: string; projectId?: string }) =>
    api.post<Session>('/sessions', data).then((r) => r.data),
  list: () => api.get<Session[]>('/sessions').then((r) => r.data),
  getById: (id: string) => api.get<Session>(`/sessions/${id}`).then((r) => r.data),
  confirm: (id: string) => api.patch<Session>(`/sessions/${id}/confirm`).then((r) => r.data),
  cancel: (id: string) => api.patch<Session>(`/sessions/${id}/cancel`).then((r) => r.data),
};

// ─── Resources ────────────────────────────────────────────────────────────────

export const resourcesApi = {
  create: (formData: FormData) =>
    api.post<Resource>('/resources', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
  list: (query?: { category?: ResourceCategory; tags?: string; page?: number; limit?: number }) =>
    api.get<PaginatedResponse<Resource>>('/resources', { params: query }).then((r) => r.data.data),
  getById: (id: string) => api.get<Resource>(`/resources/${id}`).then((r) => r.data),
  remove: (id: string) => api.delete(`/resources/${id}`).then((r) => r.data),
};

// ─── Workspace ────────────────────────────────────────────────────────────────

export const workspaceApi = {
  getByProject: (projectId: string) =>
    api.get<Workspace>(`/workspaces/project/${projectId}`).then((r) => r.data),
  addColumn: (workspaceId: string, data: { title: string; position?: number }) =>
    api.post<KanbanColumn>(`/workspaces/${workspaceId}/columns`, data).then((r) => r.data),
  addCard: (columnId: string, data: { title: string; description?: string; priority?: CardPriority; dueDate?: string; assigneeId?: string }) =>
    api.post<KanbanCard>(`/workspaces/columns/${columnId}/cards`, data).then((r) => r.data),
  updateCard: (cardId: string, data: Partial<{ title: string; description: string; priority: CardPriority; dueDate: string; columnId: string; assigneeId: string }>) =>
    api.patch<KanbanCard>(`/workspaces/cards/${cardId}`, data).then((r) => r.data),
};
