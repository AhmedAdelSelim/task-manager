/*
  # Initial Schema Setup for Task Management System

  1. New Tables
    - `tasks`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `owner_id` (uuid, foreign key)
      - `start_date` (timestamptz)
      - `completion_percentage` (integer)
      - `parent_id` (uuid, self-referential foreign key)
      - `custom_fields` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `owners`
      - `id` (uuid, primary key)
      - `name` (text)
      - `created_at` (timestamptz)
    
    - `custom_fields`
      - `id` (uuid, primary key)
      - `name` (text)
      - `type` (text)
      - `options` (jsonb)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create tables
CREATE TABLE IF NOT EXISTS owners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  owner_id uuid REFERENCES owners(id),
  start_date timestamptz DEFAULT now(),
  completion_percentage integer DEFAULT 0,
  parent_id uuid REFERENCES tasks(id),
  custom_fields jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS custom_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  options jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_fields ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow authenticated users to read owners"
  ON owners FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read tasks"
  ON tasks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert tasks"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update tasks"
  ON tasks FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read custom fields"
  ON custom_fields FOR SELECT
  TO authenticated
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();