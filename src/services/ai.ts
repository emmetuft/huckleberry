import { toast } from 'sonner';
import { GraphData, OntologySource } from 'models/interfaces/ontology';
import { filterInvalidLinks, isValidGraphData } from 'utils/ai';
import {
  ontologySystemPrompt,
  ontologyTemplate,
  RESUME_SYSTEM_PROMPT,
} from 'utils/prompt';
import { StepData } from 'components/modals/QuickStartModal/quickStartConfig';

const TEXT_GEN_ENDPOINT = '/api/ai/generate';

interface DomoGPTResponse {
  prompt: string;
  choices: Array<{
    output: string;
  }>;
  modelId: string;
  isCustomerModel: boolean;
}

interface TextGenRequest {
  input: string;
  system?: string;
  promptTemplate?: { template: string };
}

async function generateText<T>(request: TextGenRequest): Promise<T> {
  const response = await fetch(TEXT_GEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`AI text generation failed: ${response.status}`);
  }

  const result = await response.json();
  const payload: DomoGPTResponse = result.data ?? result;
  const rawOutput = payload.choices[0].output;

  try {
    return JSON.parse(rawOutput);
  } catch (parseError) {
    throw new Error(
      `Failed to parse AI response as JSON: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`,
    );
  }
}

const generateOntology = async (
  dataSources: OntologySource[],
): Promise<GraphData> => {
  try {
    const sourceContext = dataSources
      .map(
        (ds) => `Data source name: ${ds.name}
Schema: ${JSON.stringify(ds.schema)}
Sample Rows: ${JSON.stringify(ds.sampleRows)}\n`,
      )
      .join('\n');

    const parsedData = await generateText<unknown>({
      input: sourceContext,
      promptTemplate: { template: ontologyTemplate },
      system: ontologySystemPrompt,
    });

    if (!isValidGraphData(parsedData)) {
      throw new Error('AI response does not match expected GraphData format');
    }

    toast.success('Successfully generated ontology.');
    return filterInvalidLinks(parsedData);
  } catch (error) {
    toast.error('Could not generate ontology, please try again.');
    console.error('Error generating view metadata:', error);
    throw error;
  }
};

export async function parseResumeWithAI(
  text: string,
): Promise<Partial<StepData>> {
  return generateText<Partial<StepData>>({
    input: text,
    system: RESUME_SYSTEM_PROMPT,
  });
}

export const DomoAIService = {
  generateOntology,
  parseResumeWithAI,
};
