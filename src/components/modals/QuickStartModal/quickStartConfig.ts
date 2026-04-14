import { InputType } from 'models/enums/inputType';
import { RoleLevel } from 'models/interfaces/persona';
import { groupedDepartments } from 'constants/persona';
import { InputField } from 'components/shared/LabelInput/LabelInput';

export interface StepData {
  role: string;
  level: string;
  department: string;
  hardSkills: string[];
  softSkills: string[];
  preferredFormat: string;
  tone: string;
  decisionStyle: string;
}

export type StepDataKey = keyof StepData;

export type QuickStartField = InputField<StepDataKey>;

export interface QuickStartStep {
  heading: string;
  subtext: string;
  fields: QuickStartField[];
}

const levelOptions = Object.values(RoleLevel)
  .filter((v) => v !== RoleLevel.NONE)
  .map((v) => ({ label: v, value: v }));

const departmentOptions = groupedDepartments.flatMap((group) =>
  group.options.map((opt) => ({ label: opt, value: opt, group: group.label })),
);

export const quickStartSteps: QuickStartStep[] = [
  {
    heading: 'What do you do?',
    subtext: 'Tell us about your role so agents can speak your language.',
    fields: [
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
    ],
  },
  {
    heading: 'What skills do you bring?',
    subtext:
      'List the technical and interpersonal skills that define your work.',
    fields: [
      {
        key: 'hardSkills',
        label: 'Hard skills',
        inputType: InputType.Tags,
        placeholder: 'e.g. Python, Data Analysis, Graphic Design',
      },
      {
        key: 'softSkills',
        label: 'Soft skills',
        inputType: InputType.Tags,
        placeholder: 'e.g. Leadership, Communication',
      },
    ],
  },
  {
    heading: 'How do you like to work?',
    subtext:
      'This helps agents match your preferred style and the tools you rely on. You can always change this later.',
    fields: [
      {
        key: 'preferredFormat',
        label: 'Response format',
        inputType: InputType.RadioCards,
        options: [
          {
            value: 'brief',
            label: 'Brief',
            description: 'Short, to the point',
          },
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
  },
];

export const defaultStepData: StepData = {
  role: '',
  level: '',
  department: '',
  hardSkills: [],
  softSkills: [],
  preferredFormat: 'balanced',
  tone: 'professional',
  decisionStyle: 'data-driven',
};
