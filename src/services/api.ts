import axios from 'axios';
import { Page, Node } from '../types';

const API_URL = 'https://x211cstqci.execute-api.us-east-1.amazonaws.com/prod';

// Helper function for logging
const logApiCall = (method: string, endpoint: string, data?: any) => {
  console.group(`API Call: ${method} ${endpoint}`);
  console.log('Timestamp:', new Date().toISOString());
  if (data) {
    console.log('Request Data:', data);
  }
  console.groupEnd();
};

// Helper function for logging responses
const logApiResponse = (method: string, endpoint: string, response: any) => {
  console.group(`API Response: ${method} ${endpoint}`);
  console.log('Timestamp:', new Date().toISOString());
  console.log('Status:', response.status);
  console.log('Data:', response.data);
  console.groupEnd();
};

// Helper function for logging errors
const logApiError = (method: string, endpoint: string, error: any) => {
  console.group(`API Error: ${method} ${endpoint}`);
  console.log('Timestamp:', new Date().toISOString());
  console.error('Error:', error);
  if (error.response) {
    console.error('Response Status:', error.response.status);
    console.error('Response Data:', error.response.data);
  }
  console.groupEnd();
};

// Helper function to transform API page data to our Page type
const transformPageData = (pageData: any): Page => {
  return {
    id: pageData.PK.replace('PAGE#', ''),
    title: pageData.title,
    isPublished: pageData.isPublished === 1,
    nodes: [],
    createdAt: pageData.createdAt,
    updatedAt: pageData.updatedAt
  };
};

// Helper function to transform API node data to our Node type
const transformNodeData = (nodeData: any): Node => {
  return {
    id: nodeData.SK.replace('NODE#', ''),
    title: nodeData.title,
    description: nodeData.description,
    time: nodeData.time,
    pageId: nodeData.pageId,
    narration: nodeData.narration,
    prompt: nodeData.prompt,
    generatedImages: nodeData.generatedImages,
    predictionId: nodeData.predictionId,
    predictionStatus: nodeData.predictionStatus,
    createdAt: nodeData.createdAt,
    updatedAt: nodeData.updatedAt
  };
};

export const api = {
  // Pages
  getAllPages: async (): Promise<Page[]> => {
    const endpoint = '/pages';
    logApiCall('GET', endpoint);
    try {
      const response = await axios.get(`${API_URL}${endpoint}`);
      logApiResponse('GET', endpoint, response);
      return response.data.data.map(transformPageData);
    } catch (error) {
      logApiError('GET', endpoint, error);
      throw error;
    }
  },

  createPage: async (page: Omit<Page, 'nodes'>): Promise<Page> => {
    const endpoint = '/pages';
    const data = {
      id: page.id,
      title: page.title,
      isPublished: page.isPublished ? 1 : 0
    };
    logApiCall('POST', endpoint, data);
    try {
      const response = await axios.post(`${API_URL}${endpoint}`, data);
      logApiResponse('POST', endpoint, response);
      return transformPageData(response.data.data);
    } catch (error) {
      logApiError('POST', endpoint, error);
      throw error;
    }
  },

  getPage: async (id: string): Promise<Page> => {
    const endpoint = `/pages/${id}`;
    logApiCall('GET', endpoint);
    try {
      const response = await axios.get(`${API_URL}${endpoint}`);
      logApiResponse('GET', endpoint, response);
      return transformPageData(response.data.data);
    } catch (error) {
      logApiError('GET', endpoint, error);
      throw error;
    }
  },

  updatePage: async (id: string, page: Partial<Page>): Promise<Page> => {
    const endpoint = `/pages/${id}`;
    const data = {
      ...page,
      title: page.title,
      isPublished: page.isPublished ? 1 : 0
    };
    logApiCall('PUT', endpoint, data);
    try {
      const response = await axios.put(`${API_URL}${endpoint}`, data);
      logApiResponse('PUT', endpoint, response);
      return transformPageData(response.data.data);
    } catch (error) {
      logApiError('PUT', endpoint, error);
      throw error;
    }
  },

  deletePage: async (id: string): Promise<void> => {
    const endpoint = `/pages/${id}`;
    logApiCall('DELETE', endpoint);
    try {
      const response = await axios.delete(`${API_URL}${endpoint}`);
      logApiResponse('DELETE', endpoint, response);
    } catch (error) {
      logApiError('DELETE', endpoint, error);
      throw error;
    }
  },

  // Nodes
  getNodes: async (pageId: string): Promise<Node[]> => {
    const endpoint = `/pages/${pageId}/nodes`;
    logApiCall('GET', endpoint);
    try {
      const response = await axios.get(`${API_URL}${endpoint}`);
      logApiResponse('GET', endpoint, response);
      return response.data.data.map(transformNodeData);
    } catch (error) {
      logApiError('GET', endpoint, error);
      throw error;
    }
  },

  createNode: async (pageId: string, node: Node): Promise<Node> => {
    const endpoint = `/pages/${pageId}/nodes`;
    logApiCall('POST', endpoint, node);
    try {
      const response = await axios.post(`${API_URL}${endpoint}`, node);
      logApiResponse('POST', endpoint, response);
      return transformNodeData(response.data.data);
    } catch (error) {
      logApiError('POST', endpoint, error);
      throw error;
    }
  },

  deleteNode: async (pageId: string, nodeId: string): Promise<void> => {
    const endpoint = `/pages/${pageId}/nodes/${nodeId}`;
    logApiCall('DELETE', endpoint);
    try {
      const response = await axios.delete(`${API_URL}${endpoint}`);
      logApiResponse('DELETE', endpoint, response);
    } catch (error) {
      logApiError('DELETE', endpoint, error);
      throw error;
    }
  },

  updateNode: async (pageId: string, nodeId: string, updates: Partial<Node>): Promise<Node> => {
    const endpoint = `/pages/${pageId}/nodes/${nodeId}`;
    const data = {
      ...updates
    };
    logApiCall('PUT', endpoint, data);
    try {
      const response = await axios.put(`${API_URL}${endpoint}`, data);
      logApiResponse('PUT', endpoint, response);
      return transformNodeData(response.data.data);
    } catch (error) {
      logApiError('PUT', endpoint, error);
      throw error;
    }
  }
};
