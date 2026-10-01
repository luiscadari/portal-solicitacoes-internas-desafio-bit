import type { User } from '@/types';
import { api } from './api';

export const authService = {
  async login(username: string, password: string): Promise<User> {
    const { data } = await api.post<{ user: User }>('/auth/login', { username, password });
    return data.user;
  },
  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },
  async me(): Promise<User> {
    const { data } = await api.get<{ user: User }>('/auth/me');
    return data.user;
  },
};
