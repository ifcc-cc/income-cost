interface FetchOptions extends RequestInit {
  params?: Record<string, string>;
}

const API_URL = 'http://localhost:3000';

class ApiClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    // 从本地存储恢复 Token
    this.accessToken = localStorage.getItem('accessToken');
    this.refreshToken = localStorage.getItem('refreshToken');
  }

  setTokens(access: string, refresh: string) {
    this.accessToken = access;
    this.refreshToken = refresh;
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  async request<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { params, ...init } = options;
    
    // 构建 URL
    let url = `${API_URL}${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }

    // 默认 Headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...init.headers,
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    try {
      let response = await fetch(url, { ...init, headers });

      // 如果 403 Forbidden，可能是 Access Token 过期
      if (response.status === 403 && this.refreshToken) {
        // 尝试刷新 Token
        const refreshRes = await fetch(`${API_URL}/auth/refresh-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: this.refreshToken }),
        });

        if (refreshRes.ok) {
          const { accessToken } = await refreshRes.json();
          this.setTokens(accessToken, this.refreshToken); // 更新 Access Token
          
          // 重试原请求
          headers['Authorization'] = `Bearer ${accessToken}`;
          response = await fetch(url, { ...init, headers });
        } else {
          // 刷新失败，强制登出
          this.clearTokens();
          window.location.reload(); 
          throw new Error('Session expired');
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Network response was not ok');
      }

      return response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // 快捷方法
  get<T>(endpoint: string, params?: Record<string, string>) {
    return this.request<T>(endpoint, { method: 'GET', params });
  }

  post<T>(endpoint: string, body: any) {
    return this.request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) });
  }
}

export const api = new ApiClient();
