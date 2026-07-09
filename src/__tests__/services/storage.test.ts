import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { StorageService } from '../../services/storage';
import { Persona, RoleLevel } from 'models/interfaces/persona';

describe('StorageService', () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  let originalFetch: typeof global.fetch;

  const basePersona: Persona = {
    role: 'Principal Engineer',
    level: RoleLevel.SENIOR,
    department: 'Engineering',
    team: 'Platform',
    relationships: [],
    goals: 'Ship reliable systems',
    focusAreas: ['reliability'],
    strengths: ['systems thinking'],
    weaknesses: [],
    skills: [{ name: 'SQL', type: 'hard' }],
    tools: ['Domo'],
    communicationStyle: {
      preferredFormat: 'detailed',
      tone: 'professional',
      decisionStyle: 'data-driven',
    },
    domainKnowledge: ['data engineering'],
  };

  // Simulates what the server returns — includes fields not in the Persona interface
  const serverPersona = {
    ...basePersona,
    id: 'persona-abc',
    name: 'Principal Engineer',
    isDefault: false,
    createdAt: '2026-07-01T00:00:00.000Z',
    updatedAt: '2026-07-09T00:00:00.000Z',
  };

  function mockResponse(body: unknown, ok = true) {
    return {
      ok,
      status: ok ? 200 : 400,
      statusText: ok ? 'OK' : 'Bad Request',
      json: async () => body,
    };
  }

  beforeEach(() => {
    originalFetch = global.fetch;
    fetchMock = vi.fn();
    global.fetch = fetchMock;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.clearAllMocks();
  });

  describe('getUserPersona', () => {
    it('returns the first persona from the array', async () => {
      fetchMock.mockResolvedValueOnce(mockResponse([serverPersona]));

      const result = await StorageService.getUserPersona();

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/personas',
        expect.objectContaining({ method: 'GET' }),
      );
      expect(result).toEqual(serverPersona);
    });

    it('returns null when the array is empty', async () => {
      fetchMock.mockResolvedValueOnce(mockResponse([]));
      const result = await StorageService.getUserPersona();
      expect(result).toBeNull();
    });

    it('throws when the response is not ok', async () => {
      fetchMock.mockResolvedValueOnce(mockResponse(null, false));
      await expect(StorageService.getUserPersona()).rejects.toThrow(
        'Failed to fetch persona',
      );
    });
  });

  describe('saveUserPersona', () => {
    it('POSTs to /api/personas when persona has no id (new)', async () => {
      fetchMock.mockResolvedValueOnce(mockResponse(serverPersona));

      const result = await StorageService.saveUserPersona(basePersona);

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/personas',
        expect.objectContaining({ method: 'POST' }),
      );
      const sentBody = JSON.parse(
        (fetchMock.mock.calls[0][1] as RequestInit).body as string,
      );
      expect(sentBody.name).toBe('Principal Engineer');
      expect(result).toEqual(serverPersona);
    });

    it('adds name from role when creating', async () => {
      fetchMock.mockResolvedValueOnce(mockResponse(serverPersona));
      const personaWithoutName = { ...basePersona };

      await StorageService.saveUserPersona(personaWithoutName);

      const sentBody = JSON.parse(
        (fetchMock.mock.calls[0][1] as RequestInit).body as string,
      );
      expect(sentBody.name).toBe('Principal Engineer');
    });

    it('PUTs to /api/personas/:id when persona has an id (update)', async () => {
      fetchMock.mockResolvedValueOnce(mockResponse(serverPersona));

      await StorageService.saveUserPersona(serverPersona as unknown as Persona);

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/personas/persona-abc',
        expect.objectContaining({ method: 'PUT' }),
      );
    });

    it('strips server-managed fields from PUT body', async () => {
      fetchMock.mockResolvedValueOnce(mockResponse(serverPersona));

      await StorageService.saveUserPersona(serverPersona as unknown as Persona);

      const sentBody = JSON.parse(
        (fetchMock.mock.calls[0][1] as RequestInit).body as string,
      );
      expect(sentBody).not.toHaveProperty('id');
      expect(sentBody).not.toHaveProperty('isDefault');
      expect(sentBody).not.toHaveProperty('createdAt');
      expect(sentBody).not.toHaveProperty('updatedAt');
    });

    it('preserves persona data fields in PUT body', async () => {
      fetchMock.mockResolvedValueOnce(mockResponse(serverPersona));

      await StorageService.saveUserPersona(serverPersona as unknown as Persona);

      const sentBody = JSON.parse(
        (fetchMock.mock.calls[0][1] as RequestInit).body as string,
      );
      expect(sentBody.role).toBe('Principal Engineer');
      expect(sentBody.skills).toEqual([{ name: 'SQL', type: 'hard' }]);
    });

    it('throws when the response is not ok', async () => {
      fetchMock.mockResolvedValueOnce(mockResponse(null, false));
      await expect(
        StorageService.saveUserPersona(serverPersona as unknown as Persona),
      ).rejects.toThrow('Failed to save persona');
    });
  });
});
