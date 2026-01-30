import dotenv from 'dotenv';
import { Persona } from '../../shared/models/interfaces/persona.ts';
import { extractAppDbData } from '../utils/appdb.js';

dotenv.config();

const BASE_URL = process.env.DOMO_INSTANCE_URL || 'https://domo-es.domo.com';
const COLLECTION_ID = 'd3931866-819d-465b-8e73-cdf24bc3b120';
const DEVELOPER_TOKEN = process.env.DEV_TOKEN;

/**
 * Persona Service
 * Handles user persona retrieval from Domo AppDB
 */
class PersonaService {
  private userPersonaCache: Map<string, Persona>;
  private baseUrl: string;
  private collectionId: string;
  private headers: Record<string, string>;

  constructor() {
    this.userPersonaCache = new Map();
    this.baseUrl = BASE_URL;
    this.collectionId = COLLECTION_ID;
    this.headers = {
      'X-DOMO-Developer-Token': DEVELOPER_TOKEN || '',
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };
  }

  /**
   * Fetch user persona from Domo AppDB
   * Results are cached indefinitely until invalidated
   */
  async getUserPersona(userId: string): Promise<Persona | null> {
    // Check cache first
    const cached = this.userPersonaCache.get(userId);
    if (cached) {
      console.log('Using cached user persona for user:', userId);
      return cached;
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/api/datastores/v2/collections/${this.collectionId}/documents/query`,
        {
          method: 'POST',
          headers: this.headers,
          body: JSON.stringify({
            owner: userId.toString(),
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          `AppDB query failed: ${response.status} ${response.statusText}`,
        );
      }

      const documents = (await response.json()) as any;
      const personas = extractAppDbData<Persona>(documents);

      if (personas && personas.length > 0) {
        const persona = personas[0];

        // Cache the result
        this.userPersonaCache.set(userId, persona);

        return persona;
      }

      return null;
    } catch (error) {
      console.error('Error fetching user persona:', error);
      return null;
    }
  }

  /**
   * Save user persona to Domo AppDB (create or update)
   * Updates cache after successful save
   */
  async saveUserPersona(userId: string, persona: Persona): Promise<Persona> {
    try {
      let response;

      if (persona.id) {
        // Update existing persona
        const { id, ...content } = persona;
        response = await fetch(
          `${this.baseUrl}/api/datastores/v2/collections/${this.collectionId}/documents/${id}`,
          {
            method: 'PUT',
            headers: this.headers,
            body: JSON.stringify({ content }),
          },
        );
      } else {
        // Create new persona
        response = await fetch(
          `${this.baseUrl}/api/datastores/v2/collections/${this.collectionId}/documents`,
          {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify({ content: persona }),
          },
        );
      }

      if (!response.ok) {
        throw new Error(
          `AppDB save failed: ${response.status} ${response.statusText}`,
        );
      }

      const document = (await response.json()) as any;
      const savedPersonas = extractAppDbData<Persona>(document);
      const savedPersona = savedPersonas[0];

      // Update cache with the saved persona
      this.userPersonaCache.set(userId, savedPersona);

      return savedPersona;
    } catch (error) {
      console.error('Error saving user persona:', error);
      throw error;
    }
  }

  /**
   * Build persona context for a user request
   * Returns formatted text context with persona information
   */
  async buildPersonaContext(userId: string): Promise<{
    textContext: string;
    metadata: Record<string, any>;
  }> {
    if (!userId) {
      return {
        textContext: '',
        metadata: {
          error: 'No userId provided',
        },
      };
    }

    try {
      const persona = await this.getUserPersona(userId);

      if (!persona) {
        return {
          textContext: '',
          metadata: {
            personaFound: false,
          },
        };
      }

      // Only include persona context if usePersona flag is true
      if (!persona.usePersona) {
        return {
          textContext: '',
          metadata: {
            personaFound: true,
            personaDisabled: true,
          },
        };
      }

      // Format persona into readable context
      const textContext = this.formatPersonaContext(persona);

      return {
        textContext,
        metadata: {
          personaFound: true,
        },
      };
    } catch (error) {
      console.error('Error building persona context:', error);
      return {
        textContext: '',
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Format persona data into readable context for the LLM
   */
  private formatPersonaContext(persona: Persona): string {
    let formatted = '# User Profile\n\n';

    formatted += `**Role:** ${persona.role}\n`;
    formatted += `**Level:** ${persona.level}\n`;
    formatted += `**Department:** ${persona.department}\n`;
    formatted += `**Team:** ${persona.team}\n\n`;

    if (persona.focusAreas && persona.focusAreas.length > 0) {
      formatted += `**Focus Areas:**\n`;
      persona.focusAreas.forEach((area) => {
        formatted += `- ${area}\n`;
      });
      formatted += '\n';
    }

    if (persona.strengths && persona.strengths.length > 0) {
      formatted += `**Strengths:**\n`;
      persona.strengths.forEach((strength) => {
        formatted += `- ${strength}\n`;
      });
      formatted += '\n';
    }

    if (persona.weaknesses && persona.weaknesses.length > 0) {
      formatted += `**Areas for Development:**\n`;
      persona.weaknesses.forEach((weakness) => {
        formatted += `- ${weakness}\n`;
      });
      formatted += '\n';
    }

    if (persona.goals) {
      formatted += `**Goals:**\n${persona.goals}\n\n`;
    }

    return formatted;
  }

  /**
   * Invalidate the cache for a specific user (useful after persona is updated)
   */
  invalidateUserPersonaCache(userId: string): void {
    this.userPersonaCache.delete(userId);
  }

  /**
   * Clear all cached user personas
   */
  clearCache(): void {
    this.userPersonaCache.clear();
  }
}

export const personaService = new PersonaService();
