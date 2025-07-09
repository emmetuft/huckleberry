export interface Persona {
  id?: string;
  role: string;
  department: string;
  focusAreas: string[];
  usePersona: boolean;
  useActivity: boolean;
  useData: boolean;
}

// export type PersonaData = Omit<Persona, 'collaborators'> & {
//     collaborators: string;
//   };
