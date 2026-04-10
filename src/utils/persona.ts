import { defaultPersona } from 'constants/persona';
import {
  Persona,
  PersonaCommunicationStyle,
  RoleLevel,
} from 'models/interfaces/persona';

export const buildPersona = (data: any, persona?: Persona): Persona => ({
  ...(persona ?? defaultPersona),
  role: data.role,
  level: data.level as RoleLevel,
  department: data.department,
  skills: [
    ...(data.hardSkills as string[]).map((name) => ({
      name,
      type: 'hard' as const,
    })),
    ...(data.softSkills as string[]).map((name) => ({
      name,
      type: 'soft' as const,
    })),
  ],
  tools: data.tools as string[],
  communicationStyle: {
    preferredFormat:
      data.preferredFormat as PersonaCommunicationStyle['preferredFormat'],
    tone: data.tone as PersonaCommunicationStyle['tone'],
    decisionStyle:
      data.decisionStyle as PersonaCommunicationStyle['decisionStyle'],
  },
});
