export interface Task {
  id: string;
  name: string;
  description?: string;
  owner_id?: string;
  start_date?: string;
  completion_percentage: number;
  parent_id?: string | null;
  custom_fields?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Owner {
  id: string;
  name: string;
  email: string;
}

export interface CustomField {
  id: string;
  name: string;
  field_type: string;
  options?: any[];
}