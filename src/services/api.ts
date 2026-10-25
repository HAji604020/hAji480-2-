import { Company, Product, User, CustomerInquiry, GeneratedSalesReply, SecurityAuditResult, SupportTicket } from '../types';

let currentAuthToken: string = 'token_heka_admin_secret'; // Default to HEKA LTD Admin for demo

export const api = {
  setToken(token: string) {
    currentAuthToken = token;
  },

  getToken(): string {
    return currentAuthToken;
  },

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {})
    };

    if (currentAuthToken && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${currentAuthToken}`;
    }

    const response = await fetch(endpoint, {
      ...options,
      headers
    });

    if (!response.ok) {
      let errMsg = `Request failed: ${response.status} ${response.statusText}`;
      try {
        const data = await response.json();
        if (data.error) errMsg = data.error;
      } catch {
        // fallback
      }
      throw new Error(errMsg);
    }

    return response.json();
  },

  // Public Catalog API
  async getPublicCatalog(slug: string): Promise<{ company: Company; products: Product[] }> {
    return this.request<{ company: Company; products: Product[] }>(`/api/public/catalog/${slug}`);
  },

  async submitPublicInquiry(inquiry: Partial<CustomerInquiry>): Promise<CustomerInquiry> {
    return this.request<CustomerInquiry>('/api/public/inquiries', {
      method: 'POST',
      body: JSON.stringify(inquiry)
    });
  },

  // Auth & Onboarding
  async login(email: string, token?: string): Promise<{ user: User; company: Company | null }> {
    const res = await this.request<{ user: User; company: Company | null }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, token })
    });
    if (res.user?.token) {
      this.setToken(res.user.token);
    }
    return res;
  },

  async registerCompany(payload: {
    name: string;
    industry: string;
    country: string;
    currency: string;
    adminEmail: string;
    adminName: string;
    contactPhone: string;
    brandColors?: { primary: string; accent: string };
  }): Promise<{ company: Company; user: User }> {
    const res = await this.request<{ company: Company; user: User }>('/api/auth/register-company', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    if (res.user?.token) {
      this.setToken(res.user.token);
    }
    return res;
  },

  // Companies
  async getCompanies(): Promise<Company[]> {
    return this.request<Company[]>('/api/companies');
  },

  async updateCompany(companyId: string, updates: Partial<Company>): Promise<Company> {
    return this.request<Company>(`/api/companies/${companyId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  // Products
  async getProducts(companyId: string): Promise<Product[]> {
    return this.request<Product[]>(`/api/products?companyId=${encodeURIComponent(companyId)}`);
  },

  async createProduct(product: Partial<Product>): Promise<Product> {
    return this.request<Product>('/api/products', {
      method: 'POST',
      body: JSON.stringify(product)
    });
  },

  async updateProduct(productId: string, updates: Partial<Product>): Promise<Product> {
    return this.request<Product>(`/api/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  async deleteProduct(productId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/api/products/${productId}`, {
      method: 'DELETE'
    });
  },

  // Image Upload
  async uploadImage(imageData: string, name?: string): Promise<{ url: string }> {
    return this.request<{ url: string }>('/api/upload-image', {
      method: 'POST',
      body: JSON.stringify({ imageData, name })
    });
  },

  // Inquiries
  async getInquiries(companyId: string): Promise<CustomerInquiry[]> {
    return this.request<CustomerInquiry[]>(`/api/inquiries?companyId=${encodeURIComponent(companyId)}`);
  },

  // AI Grounded Sales Engine
  async generateAIReply(productId: string, customerMessage: string, targetLang: string): Promise<GeneratedSalesReply> {
    return this.request<GeneratedSalesReply>('/api/ai/generate-reply', {
      method: 'POST',
      body: JSON.stringify({ productId, customerMessage, targetLang })
    });
  },

  // Cross-Tenant Security Audit
  async runSecurityAudit(): Promise<{
    timestamp: string;
    totalTests: number;
    allPassed: boolean;
    results: SecurityAuditResult[];
  }> {
    return this.request('/api/tests/cross-tenant-isolation', {
      method: 'POST'
    });
  },

  // Support Tickets API
  async getSupportTickets(companyId: string): Promise<SupportTicket[]> {
    return this.request<SupportTicket[]>(`/api/support/tickets?companyId=${encodeURIComponent(companyId)}`);
  },

  async createSupportTicket(ticket: Partial<SupportTicket>): Promise<SupportTicket> {
    return this.request<SupportTicket>('/api/support/tickets', {
      method: 'POST',
      body: JSON.stringify(ticket)
    });
  },

  async updateSupportTicket(ticketId: string, updates: Partial<SupportTicket>): Promise<SupportTicket> {
    return this.request<SupportTicket>(`/api/support/tickets/${encodeURIComponent(ticketId)}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  }
};
