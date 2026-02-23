import { Persona } from 'models/interfaces/persona';

const PERSONA_API_BASE = '/api/persona';

const fetchUserPersona = async (userId: number): Promise<Persona> => {
  try {
    const response = await fetch(`${PERSONA_API_BASE}/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch persona: ${response.status} ${response.statusText}`,
      );
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Unknown error');
    }

    return result.data;
  } catch (error: any) {
    throw error;
  }
};

const saveUserPersona = async (
  userId: number,
  userPersona: Persona,
): Promise<Persona> => {
  try {
    const response = await fetch(`${PERSONA_API_BASE}/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userPersona),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to save persona: ${response.status} ${response.statusText}`,
      );
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Unknown error');
    }

    return result.data;
  } catch (error: any) {
    throw error;
  }
};

export const StorageService = {
  fetchUserPersona,
  saveUserPersona,
};
