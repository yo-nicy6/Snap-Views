import axios from 'axios';
import { SnapData, ApiSettings } from '../types';

const api = axios.create({ baseURL: '/api' });

export async function fetchSnap(username: string): Promise<{ data: SnapData; cached: boolean; age: number }> {
  const res = await api.get(`/snap?username=${encodeURIComponent(username)}`);
  return res.data;
}

export async function getSettings(): Promise<ApiSettings> {
  const res = await api.get('/settings');
  return res.data;
}

export async function updateSettings(settings: { enabled?: boolean; ttl?: number }): Promise<void> {
  await api.put('/settings', settings);
}

export async function clearCache(): Promise<{ cleared: number }> {
  const res = await api.delete('/cache');
  return res.data;
}

export async function clearUserCache(username: string): Promise<void> {
  await api.delete(`/cache/${username}`);
}

export async function getHealth(): Promise<{ status: string; uptime: number; cacheSize: number }> {
  const res = await api.get('/health');
  return res.data;
}
