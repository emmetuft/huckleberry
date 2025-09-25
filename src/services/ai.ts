import { GraphData, OntologySource } from 'models/interfaces/ontology';
import domo from 'ryuu.js';
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

    const response: any = await domo.post<DomoGPTResponse>(
      TEXT_GEN_ENDPOINT,
      body,
    );
    const data = response.choices[0].output;
    return JSON.parse(data) as GraphData;
  } catch (error) {
    console.error('Error generating view metadata:', error);
    throw error;
  }
};

export const DomoAIService = {
  generateOntology,
};
