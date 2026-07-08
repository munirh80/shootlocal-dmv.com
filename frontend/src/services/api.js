import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Simple in-memory cache
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get data from cache or fetch from API
 */
const getCachedData = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

/**
 * Set data in cache
 */
const setCachedData = (key, data) => {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
};

/**
 * Clear specific cache entry
 */
export const clearCache = (key) => {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
};

/**
 * Fetch ranges with caching
 */
export const fetchRanges = async (params = {}) => {
  const cacheKey = `ranges_${JSON.stringify(params)}`;
  const cached = getCachedData(cacheKey);
  
  if (cached) {
    return cached;
  }

  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      queryParams.append(key, value);
    }
  });

  const response = await axios.get(`${API}/ranges?${queryParams.toString()}`);
  setCachedData(cacheKey, response.data);
  return response.data;
};

/**
 * Fetch stats with caching
 */
export const fetchStats = async () => {
  const cacheKey = 'stats';
  const cached = getCachedData(cacheKey);
  
  if (cached) {
    return cached;
  }

  const response = await axios.get(`${API}/stats`);
  setCachedData(cacheKey, response.data);
  return response.data;
};

/**
 * Fetch single range with caching
 */
export const fetchRange = async (id) => {
  const cacheKey = `range_${id}`;
  const cached = getCachedData(cacheKey);
  
  if (cached) {
    return cached;
  }

  const response = await axios.get(`${API}/ranges/${id}`);
  setCachedData(cacheKey, response.data);
  return response.data;
};

/**
 * Submit a review (no caching, clears range cache)
 */
export const submitReview = async (rangeId, reviewData) => {
  const response = await axios.post(`${API}/ranges/${rangeId}/reviews`, reviewData);
  // Clear the range cache to get fresh data with the new review
  clearCache(`range_${rangeId}`);
  return response.data;
};

/**
 * Submit a new range (no caching)
 */
export const submitRange = async (rangeData) => {
  const response = await axios.post(`${API}/ranges/submit`, rangeData);
  // Clear ranges cache as there's new data
  clearCache();
  return response.data;
};

export default {
  fetchRanges,
  fetchStats,
  fetchRange,
  submitReview,
  submitRange,
  clearCache,
};
