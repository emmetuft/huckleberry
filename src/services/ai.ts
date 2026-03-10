import { toast } from 'sonner';
import { GraphData, OntologySource } from 'models/interfaces/ontology';
import { filterInvalidLinks, isValidGraphData } from 'utils/ai';
import { ontologySystemPrompt, ontologyTemplate } from 'utils/prompt';

const TEXT_GEN_ENDPOINT = '/domo/ai/v1/text/generation';

interface DomoGPTResponse {
  prompt: string;
  choices: Array<{
    output: string;
  }>;
  modelId: string;
  isCustomerModel: boolean;
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

    const body = {
      input: sourceContext,
      promptTemplate: {
        template: ontologyTemplate,
      },
      system: ontologySystemPrompt,
    };

    const response = await fetch(TEXT_GEN_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      toast.error('Could not generate ontology, please try again.');
      throw new Error(`AI text generation failed: ${response.status}`);
    }

    const result = await response.json();
    const payload: DomoGPTResponse = result.data ?? result;
    const rawData = payload.choices[0].output;

    // Parse JSON with error handling
    let parsedData: any;
    try {
      parsedData = JSON.parse(rawData);
    } catch (parseError) {
      toast.error('Could not generate ontology, please try again.');
      throw new Error(
        `Failed to parse AI response as JSON: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`,
      );
    }

    // Validate GraphData format
    if (!isValidGraphData(parsedData)) {
      toast.error('Could not generate ontology, please try again.');
      throw new Error('AI response does not match expected GraphData format');
    }

    toast.success('Successfully generated ontology.');
    return filterInvalidLinks(parsedData);
  } catch (error) {
    console.error('Error generating view metadata:', error);
    throw error;
  }
};

export const DomoAIService = {
  generateOntology,
};
