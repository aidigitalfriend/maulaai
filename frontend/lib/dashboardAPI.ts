// Mock API endpoints for dashboard analytics
// These will be used to fetch real data from the backend

// API Response Types
export interface DashboardResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
  error?: string;
}

// Fetch API metrics
export async function fetchApiMetrics(days: number = 7): Promise<DashboardResponse<any>> {
  try {
    // Replace with your actual API endpoint
    const response = await fetch(`/api/dashboard/metrics?days=${days}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) throw new Error('Failed to fetch metrics');
    return await response.json();
  } catch (error) {
    console.error('Error fetching metrics:', error);
    throw error;
  }
}

// Fetch model usage data
export async function fetchModelUsage(): Promise<DashboardResponse<any>> {
  try {
    const response = await fetch('/api/dashboard/model-usage', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) throw new Error('Failed to fetch model usage');
    return await response.json();
  } catch (error) {
    console.error('Error fetching model usage:', error);
    throw error;
  }
}

// Fetch success/failure rates
export async function fetchSuccessFailureRates(): Promise<DashboardResponse<any>> {
  try {
    const response = await fetch('/api/dashboard/success-failure', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) throw new Error('Failed to fetch success/failure rates');
    return await response.json();
  } catch (error) {
    console.error('Error fetching success/failure rates:', error);
    throw error;
  }
}

// Fetch token usage
export async function fetchTokenUsage(): Promise<DashboardResponse<any>> {
  try {
    const response = await fetch('/api/dashboard/token-usage', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) throw new Error('Failed to fetch token usage');
    return await response.json();
  } catch (error) {
    console.error('Error fetching token usage:', error);
    throw error;
  }
}

// Fetch geographic distribution
export async function fetchGeographicData(): Promise<DashboardResponse<any>> {
  try {
    const response = await fetch('/api/dashboard/geographic', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) throw new Error('Failed to fetch geographic data');
    return await response.json();
  } catch (error) {
    console.error('Error fetching geographic data:', error);
    throw error;
  }
}

// Fetch peak traffic hours
export async function fetchPeakTraffic(): Promise<DashboardResponse<any>> {
  try {
    const response = await fetch('/api/dashboard/peak-traffic', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) throw new Error('Failed to fetch peak traffic');
    return await response.json();
  } catch (error) {
    console.error('Error fetching peak traffic:', error);
    throw error;
  }
}

// Fetch error breakdown
export async function fetchErrorBreakdown(): Promise<DashboardResponse<any>> {
  try {
    const response = await fetch('/api/dashboard/error-breakdown', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) throw new Error('Failed to fetch error breakdown');
    return await response.json();
  } catch (error) {
    console.error('Error fetching error breakdown:', error);
    throw error;
  }
}

// Fetch response size data
export async function fetchResponseSizeData(): Promise<DashboardResponse<any>> {
  try {
    const response = await fetch('/api/dashboard/response-size', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) throw new Error('Failed to fetch response size data');
    return await response.json();
  } catch (error) {
    console.error('Error fetching response size data:', error);
    throw error;
  }
}

// Fetch cost estimation
export async function fetchCostEstimation(): Promise<DashboardResponse<any>> {
  try {
    const response = await fetch('/api/dashboard/cost-estimation', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) throw new Error('Failed to fetch cost estimation');
    return await response.json();
  } catch (error) {
    console.error('Error fetching cost estimation:', error);
    throw error;
  }
}

// Fetch all dashboard data at once
export async function fetchDashboardData() {
  try {
    const [
      metrics,
      modelUsage,
      successFailure,
      tokenUsage,
      geographic,
      peakTraffic,
      errors,
      responseSize,
      costs
    ] = await Promise.all([
      fetchApiMetrics(),
      fetchModelUsage(),
      fetchSuccessFailureRates(),
      fetchTokenUsage(),
      fetchGeographicData(),
      fetchPeakTraffic(),
      fetchErrorBreakdown(),
      fetchResponseSizeData(),
      fetchCostEstimation()
    ]);

    return {
      success: true,
      data: {
        metrics: metrics.data,
        modelUsage: modelUsage.data,
        successFailure: successFailure.data,
        tokenUsage: tokenUsage.data,
        geographic: geographic.data,
        peakTraffic: peakTraffic.data,
        errors: errors.data,
        responseSize: responseSize.data,
        costs: costs.data
      }
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
}
