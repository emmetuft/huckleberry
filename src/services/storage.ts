import { AppDBClient } from '@domoinc/toolkit';
import { Persona } from 'models/interfaces/persona';
import { extractAppDbData } from 'utils/service';

const PersonaClient = new AppDBClient.DocumentsClient<Persona>('UserPersona');

const fetchUserPersona = async (userId: number): Promise<Persona> => {
  const persona = extractAppDbData<Persona>(
    await PersonaClient.get({
      owner: userId,
    }),
  )[0];
  return persona;
};

const saveUserPersona = async (userPersona: Persona) => {
  let persona: Persona = userPersona;
  if (userPersona.id) {
    // Update existing persona
    const { id, ...content } = userPersona;
    persona = extractAppDbData<Persona>(
      await PersonaClient.update({
        id,
        content,
      }),
    )[0];
  } else {
    // Create new persona
    persona = extractAppDbData<Persona>(
      await PersonaClient.create(userPersona),
    )[0];
  }

  return persona;
};

export const StorageService = {
  fetchUserPersona,
  saveUserPersona,
};
