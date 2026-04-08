import {
  Brain,
  ChartBar,
  ChatCircle,
  Gear,
  IdentificationCard,
  Star,
  UsersFour,
} from 'phosphor-react';
import { InputType } from 'models/enums/inputType';
import { InputField } from 'components/shared/LabelInput/LabelInput';
import { Persona, RoleLevel } from 'models/interfaces/persona';
import { groupedDepartments } from 'constants/persona';
import { isEmpty } from 'utils/misc';

export enum SectionStatus {
  Complete = 'Complete',
  InProgress = 'In progress',
  NotStarted = 'Not started',
}

const iconSize = 20;

export type PersonaSection =
  | 'role'
  | 'skills'
  | 'goals'
  | 'relationships'
  | 'tools'
  | 'communicationStyle'
  | 'domainKnowledge';

export interface SectionDef {
  key: PersonaSection;
  label: string;
  description: string;
  icon: React.ReactNode;
  status: (persona: Persona) => SectionStatus;
}

export const sections: SectionDef[] = [
  {
    key: 'role',
    label: 'Role & Identity',
    description: 'Your job title, level, and department',
    icon: <IdentificationCard size={iconSize} />,
    status: (p) => {
      const filled = [p.role, p.level, p.department, p.team].filter(
        (v) => !isEmpty(v),
      ).length;
      if (filled === 4) return SectionStatus.Complete;
      if (filled > 0) return SectionStatus.InProgress;
      return SectionStatus.NotStarted;
    },
  },
  {
    key: 'skills',
    label: 'Skills',
    description: 'Hard and soft skills you bring to your work',
    icon: <Star size={iconSize} />,
    status: (p) => {
      const hasHard = p.skills.some((s) => s.type === 'hard');
      const hasSoft = p.skills.some((s) => s.type === 'soft');
      if (hasHard && hasSoft) return SectionStatus.Complete;
      if (hasHard || hasSoft) return SectionStatus.InProgress;
      return SectionStatus.NotStarted;
    },
  },
  {
    key: 'goals',
    label: 'Goals & Priorities',
    description: "What you're trying to achieve",
    icon: <ChartBar size={iconSize} />,
    status: (p) => {
      if (p.goals && p.focusAreas.length > 0) return SectionStatus.Complete;
      if (p.goals || p.focusAreas.length > 0) return SectionStatus.InProgress;
      return SectionStatus.NotStarted;
    },
  },
  {
    key: 'relationships',
    label: 'Team & Relationships',
    description: 'Key people you work with',
    icon: <UsersFour size={iconSize} />,
    status: (p) =>
      p.relationships.length > 0
        ? SectionStatus.Complete
        : SectionStatus.NotStarted,
  },
  {
    key: 'tools',
    label: 'Tools & Systems',
    description: 'Software and platforms you rely on',
    icon: <Gear size={iconSize} />,
    status: (p) =>
      p.tools.length > 0 ? SectionStatus.Complete : SectionStatus.NotStarted,
  },
  {
    key: 'communicationStyle',
    label: 'Communication Style',
    description: 'How you prefer agents to respond',
    icon: <ChatCircle size={iconSize} />,
    status: (p) =>
      !isEmpty(p.communicationStyle)
        ? SectionStatus.Complete
        : SectionStatus.NotStarted,
  },
  {
    key: 'domainKnowledge',
    label: 'Domain Knowledge',
    description: 'Areas of deep expertise',
    icon: <Brain size={iconSize} />,
    status: (p) =>
      p.domainKnowledge.length > 0
        ? SectionStatus.Complete
        : SectionStatus.NotStarted,
  },
];

export type PersonaFieldKey =
  | 'role'
  | 'level'
  | 'department'
  | 'team'
  | 'relationships'
  | 'goals'
  | 'focusAreas'
  | 'hardSkills'
  | 'softSkills'
  | 'tools'
  | 'domainKnowledge'
  | 'preferredFormat'
  | 'tone'
  | 'decisionStyle';

export type PersonaField = InputField<PersonaFieldKey>;

const levelOptions = Object.values(RoleLevel)
  .filter((v) => v !== RoleLevel.NONE)
  .map((v) => ({ label: v, value: v }));

const departmentOptions = groupedDepartments.flatMap((group) =>
  group.options.map((opt) => ({ label: opt, value: opt, group: group.label })),
);

export const sectionFields: Partial<Record<PersonaSection, PersonaField[]>> = {
  role: [
    {
      key: 'role',
      label: 'Job title',
      inputType: InputType.Text,
      placeholder: 'e.g. Product Manager',
    },
    {
      key: 'level',
      label: 'Level',
      inputType: InputType.Select,
      halfWidth: true,
      options: levelOptions,
    },
    {
      key: 'department',
      label: 'Department',
      inputType: InputType.Select,
      halfWidth: true,
      options: departmentOptions,
    },
    {
      key: 'team',
      label: 'Team',
      inputType: InputType.Text,
      placeholder: 'e.g. Growth Marketing',
    },
  ],
  goals: [
    {
      key: 'goals',
      label: 'Primary goal',
      inputType: InputType.TextArea,
      placeholder: 'e.g. Grow enterprise pipeline by 30% this quarter',
    },
    {
      key: 'focusAreas',
      label: 'Focus areas',
      inputType: InputType.Tags,
      placeholder: 'Add focus areas',
    },
  ],
  skills: [
    {
      key: 'hardSkills',
      label: 'Hard skills',
      inputType: InputType.Tags,
      placeholder: 'e.g. SQL, Python, Financial Modeling',
    },
    {
      key: 'softSkills',
      label: 'Soft skills',
      inputType: InputType.Tags,
      placeholder: 'e.g. Leadership, Communication',
    },
  ],
  relationships: [
    {
      key: 'relationships',
      label: 'Team members',
      inputType: InputType.Select,
      placeholder: 'Search for team members',
      // options will be populated from the users API
      options: [],
    },
  ],
  tools: [
    {
      key: 'tools',
      label: 'Tools & systems',
      inputType: InputType.Tags,
      placeholder: 'e.g. Salesforce, Domo, Slack',
    },
  ],
  communicationStyle: [
    {
      key: 'preferredFormat',
      label: 'Response format',
      inputType: InputType.RadioCards,
      options: [
        { value: 'brief', label: 'Brief', description: 'Short, to the point' },
        {
          value: 'balanced',
          label: 'Balanced',
          description: 'Key points with context',
          selected: true,
        },
        {
          value: 'detailed',
          label: 'Detailed',
          description: 'Thorough explanations',
        },
      ],
    },
    {
      key: 'tone',
      label: 'Tone',
      inputType: InputType.RadioCards,
      options: [
        {
          value: 'casual',
          label: 'Casual',
          description: 'Conversational and direct',
        },
        {
          value: 'professional',
          label: 'Professional',
          description: 'Clear and approachable',
          selected: true,
        },
        {
          value: 'formal',
          label: 'Formal',
          description: 'Precise and structured',
        },
      ],
    },
    {
      key: 'decisionStyle',
      label: 'Decision style',
      inputType: InputType.RadioCards,
      options: [
        {
          value: 'intuition',
          label: 'Intuition',
          description: 'High-level signals',
        },
        {
          value: 'data-driven',
          label: 'Data-driven',
          description: 'Show me the numbers',
          selected: true,
        },
        {
          value: 'consensus',
          label: 'Consensus',
          description: 'Multiple perspectives',
        },
      ],
    },
  ],
  domainKnowledge: [
    {
      key: 'domainKnowledge',
      label: 'Areas of expertise',
      inputType: InputType.Tags,
      placeholder: 'e.g. B2B SaaS, supply chain analytics',
    },
  ],
};

export const getFieldValue = (
  key: PersonaFieldKey,
  persona: Persona,
): string | string[] => {
  switch (key) {
    case 'hardSkills':
      return persona.skills.filter((s) => s.type === 'hard').map((s) => s.name);
    case 'softSkills':
      return persona.skills.filter((s) => s.type === 'soft').map((s) => s.name);
    case 'preferredFormat':
      return persona.communicationStyle?.preferredFormat ?? '';
    case 'tone':
      return persona.communicationStyle?.tone ?? '';
    case 'decisionStyle':
      return persona.communicationStyle?.decisionStyle ?? '';
    default:
      return (persona as any)[key] ?? '';
  }
};

export const applyFieldValue = (
  key: PersonaFieldKey,
  value: string | string[],
  draft: Persona,
): Persona => {
  switch (key) {
    case 'hardSkills':
      return {
        ...draft,
        skills: [
          ...draft.skills.filter((s) => s.type === 'soft'),
          ...(value as string[]).map((name) => ({
            name,
            type: 'hard' as const,
          })),
        ],
      };
    case 'softSkills':
      return {
        ...draft,
        skills: [
          ...draft.skills.filter((s) => s.type === 'hard'),
          ...(value as string[]).map((name) => ({
            name,
            type: 'soft' as const,
          })),
        ],
      };
    case 'preferredFormat':
    case 'tone':
    case 'decisionStyle':
      return {
        ...draft,
        communicationStyle: { ...draft.communicationStyle, [key]: value },
      };
    default:
      return { ...draft, [key]: value };
  }
};
