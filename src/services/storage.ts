import { apiFetch } from 'services/headers';
import { Persona } from 'models/interfaces/persona';

const PERSONAS_API = '/api/personas';

const getUserPersona = async (): Promise<Persona | null> => {
  const response = await apiFetch(PERSONAS_API, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch persona: ${response.status} ${response.statusText}`,
    );
  }

  const personas: Persona[] = await response.json();
  return personas[0] ?? null;
};

const saveUserPersona = async (persona: Persona): Promise<Persona> => {
  const isNew = !persona.id;
  const url = isNew ? PERSONAS_API : `${PERSONAS_API}/${persona.id}`;
  // Strip server-managed fields that are not in UpdatePersonaDto
  const {
    id: _id,
    isDefault: _isd,
    createdAt: _ca,
    updatedAt: _ua,
    ...update
  } = persona as any;
  const body = isNew
    ? { ...persona, name: persona.role || 'My Persona' }
    : update;

  const response = await apiFetch(url, {
    method: isNew ? 'POST' : 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
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
