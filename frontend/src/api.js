import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000";

// Backend status
export const getBackendStatus = async () => {
  const response = await axios.get(`${API_BASE_URL}/`);
  return response.data;
};

// Normal paper search
export const searchPapers = async (query, limit = 10) => {
  const response = await axios.get(`${API_BASE_URL}/papers`, {
    params: {
      query: query,
      limit: limit,
    },
  });

  return response.data;
};

// KMP keyword search
export const keywordSearchPapers = async (
  query,
  keyword,
  limit = 10
) => {
  const response = await axios.get(
    `${API_BASE_URL}/papers/keyword`,
    {
      params: {
        query: query,
        keyword: keyword,
        limit: limit,
      },
    }
  );

  return response.data;
};

// Normal reviewer allocation
export const allocatePapers = async (papers, reviewers) => {
  const response = await axios.post(
    `${API_BASE_URL}/allocation/matching`,
    {
      papers,
      reviewers,
    }
  );

  return response.data;
};

// Capacity-based reviewer allocation
export const allocateWithCapacity = async (papers, reviewers) => {
  const response = await axios.post(
    `${API_BASE_URL}/allocation/capacity`,
    {
      papers,
      reviewers,
    }
  );

  return response.data;
};

// Get allocation history
export const getAllocationHistory = async () => {
  const response = await axios.get(
    `${API_BASE_URL}/allocation/history`
  );

  return response.data;
};

// Get details of one allocation run
export const getAllocationDetails = async (runId) => {
  const response = await axios.get(
    `${API_BASE_URL}/allocation/history/${runId}`
  );

  return response.data;
};

// Get dashboard analytics
export const getAllocationAnalytics = async () => {
  const response = await axios.get(
    `${API_BASE_URL}/allocation/analytics`
  );

  return response.data;
};