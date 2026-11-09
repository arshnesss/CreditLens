import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 45000,
});

// Types & Interfaces
export interface HealthStatus {
  status: string;
  app_name: string;
  version: string;
  environment: string;
  database: string;
  timestamp: string;
}

export interface ShapContribution {
  feature: string;
  feature_value: any;
  shap_value: number;
  direction: 'increases_risk' | 'decreases_risk';
  impact: 'High' | 'Medium' | 'Low';
  description: string;
}

export interface PredictionResult {
  customer_code: string;
  default_probability: number;
  predicted_class: number;
  risk_category: 'Low' | 'Medium' | 'High';
  model_version: string;
  shap_contributions: ShapContribution[];
  base_value?: number;
  disclaimer: string;
  assessed_at: string;
}

export interface CustomerProfile {
  id: number;
  customer_code: string;
  limit_bal: number;
  sex: number;
  education: number;
  marriage: number;
  age: number;
  pay_0: number;
  bill_amt1: number;
  pay_amt1: number;
  actual_default?: number;
  segment: string;
  latest_prediction?: {
    probability: number;
    risk_category: string;
    assessed_at: string;
  };
}

export interface PortfolioOverview {
  total_customers: number;
  average_default_probability: number;
  high_risk_count: number;
  medium_risk_count: number;
  low_risk_count: number;
  risk_distribution: Array<{
    category: string;
    count: number;
    percentage: number;
    color: string;
  }>;
}

export interface ModelMetricsData {
  model_version: string;
  algorithm: string;
  training_date: string;
  default_rate: number;
  selected_model_metrics: {
    roc_auc: number;
    pr_auc: number;
    precision: number;
    recall: number;
    f1_score: number;
    brier_score: number;
    confusion_matrix: number[][];
    true_negatives: number;
    false_positives: number;
    false_negatives: number;
    true_positives: number;
  };
  top_feature_importances: Record<string, number>;
  evaluation_criteria_notes: string;
}

export interface ReportItem {
  id: number;
  report_type: 'customer' | 'portfolio';
  target_id: string;
  title: string;
  summary: string;
  created_at: string;
  pdf_available: boolean;
}

// API Methods
export const getHealth = async (): Promise<HealthStatus> => {
  const { data } = await apiClient.get<HealthStatus>('/health');
  return data;
};

export const getPortfolioOverview = async (): Promise<PortfolioOverview> => {
  const { data } = await apiClient.get<PortfolioOverview>('/analytics/overview');
  return data;
};

export const getRiskDistribution = async () => {
  const { data } = await apiClient.get('/analytics/risk-distribution');
  return data;
};

export const getSegmentAnalytics = async () => {
  const { data } = await apiClient.get('/analytics/segments');
  return data;
};

export const getHighRiskAccounts = async (limit = 10) => {
  const { data } = await apiClient.get(`/analytics/high-risk?limit=${limit}`);
  return data;
};

export const getCustomers = async (params: {
  page?: number;
  limit?: number;
  search?: string;
  risk_category?: string;
  segment?: string;
}) => {
  const { data } = await apiClient.get('/customers', { params });
  return data;
};

export const seedBenchmarkCustomers = async (count = 100) => {
  const { data } = await apiClient.post(`/customers/seed-benchmark?count=${count}`);
  return data;
};

export const getCustomer = async (customerId: string): Promise<CustomerProfile> => {
  const { data } = await apiClient.get<CustomerProfile>(`/customers/${customerId}`);
  return data;
};

export const predictRisk = async (payload: any): Promise<PredictionResult> => {
  const { data } = await apiClient.post<PredictionResult>('/predictions/predict', payload);
  return data;
};

export const getModelMetrics = async (): Promise<ModelMetricsData> => {
  const { data } = await apiClient.get<ModelMetricsData>('/model/metrics');
  return data;
};

export const getFeatureImportance = async () => {
  const { data } = await apiClient.get('/model/feature-importance');
  return data;
};

export const getReports = async (): Promise<ReportItem[]> => {
  const { data } = await apiClient.get<ReportItem[]>('/reports');
  return data;
};

export const generateReport = async (payload: {
  report_type: 'customer' | 'portfolio';
  target_id: string;
  notes?: string;
}) => {
  const { data } = await apiClient.post('/reports/generate', payload);
  return data;
};
