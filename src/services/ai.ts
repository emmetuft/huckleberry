import { AIModel } from 'models/interfaces/aiModel';
import {
  DomoAIResponse,
  ImageToTextRequest,
  TextGenRequest,
} from 'models/interfaces/aiService';
import { StepData } from 'components/modals/QuickStartModal/quickStartConfig';
import {
  CURSOR_SYSTEM_PROMPT,
  RESUME_SYSTEM_PROMPT,
  SCREENSHOT_SYSTEM_PROMPT,
} from 'utils/prompt';
import { handleResponse } from 'utils/service';

const AI_SERVICE_ENDPOINT = '/api/ai';

async function getModels(): Promise<AIModel[]> {
  const response = await fetch(`${AI_SERVICE_ENDPOINT}/models`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  const data = await handleResponse<{
    domoProvidedServiceModels: { model: AIModel }[];
    pageContext: any;
  }>(response);
  return data.domoProvidedServiceModels
    .map((content) => content.model)
    .sort((a, b) => a.name.localeCompare(b.name));
}

async function generateText<T>(
  request: TextGenRequest,
  parseJSON: boolean = false,
): Promise<T> {
  const response = await fetch(`${AI_SERVICE_ENDPOINT}/text/generation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`AI text generation failed: ${response.status}`);
  }

  const result = await response.json();
  const payload: DomoAIResponse = result.data ?? result;
  const rawOutput = payload.choices[0].output;

  if (!parseJSON) {
    return rawOutput as unknown as T;
  }

  try {
    return JSON.parse(rawOutput);
  } catch (parseError) {
    throw new Error(
      `Failed to parse AI response as JSON: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`,
    );
  }
}

async function imageToText(request: ImageToTextRequest): Promise<string> {
  const response = await fetch(`${AI_SERVICE_ENDPOINT}/image/text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`AI image-to-text failed: ${response.status}`);
  }

  const result = await response.json();
  const payload: DomoAIResponse = result.data ?? result;
  return payload.output;
}

export const DomoAIService = {
  getModels,
  generateText,
  imageToText,
};

export async function parseResumeWithAI(
  text: string,
): Promise<Partial<StepData>> {
  return generateText<Partial<StepData>>({
    input: text,
    system: RESUME_SYSTEM_PROMPT,
  });
}

export async function analyzeCursorContext(
  elementContext: string,
  input: string,
): Promise<string> {
  const fullInput = `Element context:\n${elementContext}\n\nUser question: ${input}`;
  return generateText({
    input: fullInput,
    system: CURSOR_SYSTEM_PROMPT,
  });
}

export async function analyzeScreenshot(
  image: string,
  input: string,
): Promise<string> {
  const base64 = image.split(',')[1];
  return imageToText({
    image: {
      data: base64,
      mediaType: 'image/png',
      type: 'base64',
    },
    input,
    system: SCREENSHOT_SYSTEM_PROMPT,
  });
}

// const generateOntology = async (
//   dataSources: OntologySource[],
// ): Promise<GraphData> => {
//   try {
//     const sourceContext = dataSources
//       .map(
//         (ds) => `Data source name: ${ds.name}
// Schema: ${JSON.stringify(ds.schema)}
// Sample Rows: ${JSON.stringify(ds.sampleRows)}\n`,
//       )
//       .join('\n');

//     const parsedData = await generateText<unknown>({
//       input: sourceContext,
//       promptTemplate: { template: ontologyTemplate },
//       system: ontologySystemPrompt,
//     });

//     if (!isValidGraphData(parsedData)) {
//       throw new Error('AI response does not match expected GraphData format');
//     }

//     toast.success('Successfully generated ontology.');
//     return filterInvalidLinks(parsedData);
//   } catch (error) {
//     toast.error('Could not generate ontology, please try again.');
//     console.error('Error generating view metadata:', error);
//     throw error;
//   }
// };
