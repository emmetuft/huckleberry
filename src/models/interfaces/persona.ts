export interface Persona {
  id?: string;
  role: string;
  level: RoleLevel;
  department: string;
  team: string;
  relationships: string[];
  goals: string;
  focusAreas: string[];
  strengths: string[];
  weaknesses: string[];
  skills: PersonaSkill[];
  tools: string[];
  communicationStyle: PersonaCommunicationStyle;
  domainKnowledge: string[];
}

export interface PersonaCommunicationStyle {
  preferredFormat: 'brief' | 'balanced' | 'detailed' | 'visual';
  tone: 'formal' | 'professional' | 'casual' | 'technical';
  decisionStyle: 'data-driven' | 'intuition' | 'consensus';
}

export interface PersonaSkill {
  name: string;
  type: 'hard' | 'soft';
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
