import { apiFetch } from 'services/headers';
import { Persona } from 'models/interfaces/persona';

const PERSONA_API_BASE = '/api/persona';

const getUserPersona = async (): Promise<Persona | null> => {
  const response = await apiFetch(PERSONA_API_BASE, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch persona: ${response.status} ${response.statusText}`,
    );
  }

  return response.json() as Promise<Persona | null>;
};

const saveUserPersona = async (userPersona: Persona): Promise<Persona> => {
  const response = await apiFetch(PERSONA_API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userPersona),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to save persona: ${response.status} ${response.statusText}`,
    );
  }

  return response.json() as Promise<Persona>;
};

export const StorageService = {
  getUserPersona,
  saveUserPersona,
};
