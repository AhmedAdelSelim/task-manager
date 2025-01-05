import { Task, Owner, CustomField } from '../types/task';

const API_BASE_URL = 'http://localhost:3000/api';

export const apiService = {
  async getTasks(): Promise<Task[]> {
    const response = await fetch(`${API_BASE_URL}/tasks`);
    if (!response.ok) throw new Error('Failed to fetch tasks');
    return response.json();
  },

  async getOwners(): Promise<Owner[]> {
    const response = await fetch(`${API_BASE_URL}/owners`);
    if (!response.ok) throw new Error('Failed to fetch owners');
    return response.json();
  },

  async getCustomFields(): Promise<CustomField[]> {
    const response = await fetch(`${API_BASE_URL}/custom-fields`);
    if (!response.ok) throw new Error('Failed to fetch custom fields');
    return response.json();
  },

  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!response.ok) throw new Error('Failed to update task');
    return response.json();
  },

  async createTask(taskData: Partial<Task>): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData)
    });
    if (!response.ok) throw new Error('Failed to create task');
    return response.json();
  }
}; 