// ========================================
// AI Stack Hub Admin — Shared Type Definitions
// ========================================

// ---------- Tool ----------
export interface ToolDTO {
  id: string;
  name: string;
  description: string;
  logo?: string;
  website?: string;
  pricing: "free" | "freemium" | "paid" | "enterprise";
  price?: number;
  rating?: number;
  reviewCount?: number;
  categories: string[];
  capabilities: string[];
  bestFor?: string;
  createdAt: string;
  updatedAt: string;
}

// ---------- Task ----------
export interface TaskDTO {
  id: string;
  title: string;
  description?: string;
  difficulty: "easy" | "medium" | "hard";
  category: string;
  toolCount: number;
  output?: string;
  createdAt: string;
}

// ---------- Workflow ----------
export interface WorkflowDTO {
  id: string;
  name: string;
  description?: string;
  nodes: Array<{
    id: string;
    type: "input" | "tool" | "output";
    position: { x: number; y: number };
    data: Record<string, unknown>;
  }>;
  edges: Array<{ source: string; target: string }>;
  estimatedCost?: number;
  estimatedTime?: number;
  isTemplate: boolean;
  createdAt: string;
  updatedAt: string;
}

// ---------- Article ----------
export interface ArticleDTO {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  category: string;
  tags: string[];
  readTime?: number;
  publishedAt: string;
  createdAt: string;
}

// ---------- User ----------
export interface UserDTO {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  createdAt: string;
}

// ---------- API ----------
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Admin-specific types
export interface AdminStats {
  totalTools: number;
  totalTasks: number;
  totalWorkflows: number;
  totalArticles: number;
  totalUsers: number;
  recentSignups: number;
  activeUsers: number;
}

export interface AdminLog {
  id: string;
  userId: string;
  action: string;
  target: string;
  targetId: string;
  details?: Record<string, unknown>;
  createdAt: string;
}

export interface DashboardData {
  stats: AdminStats;
  recentUsers: UserDTO[];
  recentTools: ToolDTO[];
  recentArticles: ArticleDTO[];
  userGrowth: Array<{ date: string; count: number }>;
}
