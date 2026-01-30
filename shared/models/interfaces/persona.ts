export interface Persona {
  id?: string;
  role: string;
  level: RoleLevel;
  department: string;
  team: string;
  focusAreas: string[];
  strengths: string[];
  weaknesses: string[];
  goals: string;
  usePersona: boolean;
  useActivity: boolean;
  useData: boolean;
}

export enum RoleLevel {
  INTERN = 'Intern',
  JUNIOR = 'Junior',
  MID = 'Mid',
  SENIOR = 'Senior',
  LEAD = 'Lead',
  MANAGER = 'Manager',
  DIRECTOR = 'Director',
  VP = 'VP',
  C_LEVEL = 'C-Level',
  NONE = '',
}
