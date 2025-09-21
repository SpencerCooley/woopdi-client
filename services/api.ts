// Use environment variable with fallback
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_BASE_URL) {
  throw new Error('API_BASE_URL is not defined. Please check your environment variables.');
}

export interface OrganizationMembership {
  id: number;
  user_id: number;
  organization_id: number;
  organization_name: string;
  role: string;
  is_solo: boolean;
}

export interface UserMembershipsResponse {
  memberships: OrganizationMembership[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
}

export interface CreateUser {
  email: string;
  password: string;
}

export interface SystemSettings {
  auto_create_free_subscription: boolean;
}

// Types for organization membership management
export interface OrganizationUser {
  id: number;
  user_id: number;
  organization_id: number;
  role: 'ADMIN' | 'MODERATOR' | 'MEMBER';
  user_email: string;
  user_confirmed: boolean;
  user_role: string;
}

export interface Invitation {
  id: number;
  email: string;
  organization_id: number;
  token: string;
  created_at: string;
  expires_at: string;
}

export interface InvitationCreate {
  email: string;
  organization_id: number;
}

export interface InvitationDetails {
  status: string;
  email: string;
  organization_name: string;
}

export interface InvitationAccept {
  token: string;
  password?: string;
}

// Define OrganizationRead type (matching the backend)
export interface OrganizationRead {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  is_solo: boolean;
}

export interface PublicUser {
  id: number;
  email: string;
  role: string;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export class MembershipApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'MembershipApiError';
    this.status = status;
  }
}

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    return response.json();
  }

  let errorMessage = `Request failed: ${response.status} ${response.statusText}`;
  try {
    const errorData = await response.json();
    if (errorData && errorData.detail) {
      errorMessage = errorData.detail;
    }
  } catch (e) {
    // Ignore if the body can't be parsed, we'll use the default message.
  }

  throw new ApiError(errorMessage, response.status);
}

// Helper function to get headers with auth token if available
function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const token = localStorage.getItem('accessToken');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}


export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    return handleResponse<LoginResponse>(response);
  },
  
  register: async (credentials: LoginCredentials): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    return handleResponse<User>(response);
  },

  getCurrentUser: async (): Promise<User> => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/user/me`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    return handleResponse<User>(response);
  },

  getUserMemberships: async (): Promise<UserMembershipsResponse> => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/user/memberships`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    return handleResponse<UserMembershipsResponse>(response);
  },

  requestPasswordReset: async (data: { email: string }): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/request-password-reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse<{ message: string }>(response);
  },

  resetPassword: async (data: { token: string; new_password: string }): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    return handleResponse<{ message: string }>(response);
  },
};

export const userService = {
  createUser: async (userData: CreateUser): Promise<User> => {
    return api.post<User>('/user', userData);
  },
  confirmUser: async (token: string): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/user/confirm?token=${encodeURIComponent(token)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return handleResponse<LoginResponse>(response);
  },
  resendConfirmation: async (token: string): Promise<{ message: string }> => {
    return api.post<{ message: string }>(`/user/resend-confirmation?token=${token}`, {});
  },
  getSystemSettings: async (): Promise<SystemSettings> => {
    const response = await fetch(`${API_BASE_URL}/system-settings/`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse<SystemSettings>(response);
  },
  createFreeSubscription: async (): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/subscription/free/`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse<any>(response);
  },
  listUsers: async (): Promise<PublicUser[]> => {
    const response = await fetch(`${API_BASE_URL}/user/list`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse<PublicUser[]>(response);
  },
};

export const subscriptionService = {
  create: async (payment_method_id: string, price_id: string, quantity: number): Promise<{ client_secret?: string }> => {
    return api.post<{ client_secret?: string }>('/subscription/', {
      payment_method_id,
      price_id,
      quantity,
    });
  },
};

// Service for managing organization memberships
export const membershipService = {
  // Get all users in an organization
  getUsersInOrganization: async (organizationId: number): Promise<OrganizationUser[]> => {
    const response = await fetch(`${API_BASE_URL}/organization-users/${organizationId}`, {
      headers: getHeaders(),
    });
    return handleResponse<OrganizationUser[]>(response);
  },

  // Update a user's role in an organization
  updateUserRole: async (
    organizationId: number, 
    userId: number, 
    newRole: 'ADMIN' | 'MODERATOR' | 'MEMBER'
  ): Promise<OrganizationUser> => {
    const response = await fetch(`${API_BASE_URL}/organization-users/${organizationId}/${userId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ role: newRole }),
    });
    return handleResponse<OrganizationUser>(response);
  },

  // Remove a user from an organization
  removeUserFromOrganization: async (
    organizationId: number, 
    userId: number
  ): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/organization-users/${organizationId}/${userId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse<{ message: string }>(response);
  },

  // Invite a user to an organization
  inviteUser: async (invitationData: InvitationCreate): Promise<Invitation> => {
    const response = await fetch(`${API_BASE_URL}/invitations`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(invitationData),
    });
    return handleResponse<Invitation>(response);
  },

  // Get invitation details
  getInvitationDetails: async (token: string): Promise<InvitationDetails> => {
    const response = await fetch(`${API_BASE_URL}/invitations/details?token=${token}`, {
      headers: getHeaders(),
    });
    return handleResponse<InvitationDetails>(response);
  },

  // Accept an invitation
  acceptInvitation: async (data: InvitationAccept): Promise<{ message: string } | { token: string }> => {
    const response = await fetch(`${API_BASE_URL}/invitations/accept`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{ message: string } | { token: string }>(response);
  },
};

// Service for managing organizations
export const organizationsService = {
  // Get all organizations
  getOrganizations: async (isSolo?: boolean): Promise<OrganizationRead[]> => {
    let url = `${API_BASE_URL}/organizations/`;
    
    // Add is_solo filter if provided
    if (isSolo !== undefined) {
      url += `?is_solo=${isSolo}`;
    }
    
    const response = await fetch(url, {
      headers: getHeaders(),
    });
    return handleResponse<OrganizationRead[]>(response);
  },

  // Update an organization's name
  updateOrganization: async (organizationId: number, name: string): Promise<OrganizationRead> => {
    const response = await fetch(`${API_BASE_URL}/organizations/${organizationId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ name }),
    });
    return handleResponse<OrganizationRead>(response);
  },
};


// Tool service for managing tasks and plans
export const toolService = {
  // Generate a plan based on user input
  generatePlan: async (planRequest: any): Promise<any> => {
    return api.post<any>('/tools/plan', planRequest);
  },

  // Run a tool task by name with parameters
  runToolTask: async (taskName: string, taskParams: Record<string, any> = {}): Promise<any> => {
    return api.post<any>(`/tools/task/${taskName}`, taskParams);
  },

  // Get the status of a running task by task ID
  getTaskStatus: async (taskId: string): Promise<any> => {
    return api.get<any>(`/tools/task/${taskId}/status`);
  },
};

export const assetService = {
  // Get assets with optional filters
  getAssets: async (params?: {
    skip?: number;
    limit?: number;
    user_id?: number;
    upload_source?: string;
  }): Promise<any> => {
    const queryParams = new URLSearchParams();
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
    if (params?.user_id !== undefined) queryParams.append('user_id', params.user_id.toString());
    if (params?.upload_source) queryParams.append('upload_source', params.upload_source);

    const queryString = queryParams.toString();
    const url = `/asset/${queryString ? `?${queryString}` : ''}`;
    return api.get<any>(url);
  },

  // Get a specific asset by ID
  getAsset: async (assetId: number): Promise<any> => {
    return api.get<any>(`/asset/${assetId}`);
  },

  // Delete an asset by ID
  deleteAsset: async (assetId: number): Promise<any> => {
    return api.delete<any>(`/asset/${assetId}`);
  },
};

// Generic API functions for other endpoints
export const api = {
  get: async <T>(path: string): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: getHeaders(),
    });
    return handleResponse<T>(response);
  },

  post: async <T>(path: string, data: any): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<T>(response);
  },

  put: async <T>(path: string, data: any): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<T>(response);
  },

  delete: async <T>(path: string): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse<T>(response);
  },
};

export default api;
