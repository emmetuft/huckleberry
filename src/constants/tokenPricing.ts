const PER_MILLION = 1_000_000;

export interface ModelPricing {
  inputPricePerToken: number;
  outputPricePerToken: number;
}

export const TOKEN_PRICING: Record<string, ModelPricing> = {
  // OpenAI
  'domo.openai.gpt-4o': {
    inputPricePerToken: 3.25 / PER_MILLION,
    outputPricePerToken: 13.0 / PER_MILLION,
  },
  'domo.openai.gpt-4o-mini': {
    inputPricePerToken: 0.195 / PER_MILLION,
    outputPricePerToken: 0.78 / PER_MILLION,
  },
  'domo.openai.gpt-4': {
    inputPricePerToken: 39.0 / PER_MILLION,
    outputPricePerToken: 78.0 / PER_MILLION,
  },
  'domo.openai.gpt-5': {
    inputPricePerToken: 1.625 / PER_MILLION,
    outputPricePerToken: 13.0 / PER_MILLION,
  },
  'domo.openai.gpt-5-mini': {
    inputPricePerToken: 0.325 / PER_MILLION,
    outputPricePerToken: 2.6 / PER_MILLION,
  },
  'domo.openai.gpt-5.1': {
    inputPricePerToken: 1.625 / PER_MILLION,
    outputPricePerToken: 13.0 / PER_MILLION,
  },
  'domo.openai.gpt-5.2': {
    inputPricePerToken: 2.275 / PER_MILLION,
    outputPricePerToken: 18.2 / PER_MILLION,
  },
  'domo.openai.text-embedding-ada-002': {
    inputPricePerToken: 0.065 / PER_MILLION,
    outputPricePerToken: 0,
  },

  // Anthropic (DomoGPT small)
  'domo.domo_ai.domogpt-small-v1:anthropic': {
    inputPricePerToken: 0.325 / PER_MILLION,
    outputPricePerToken: 1.625 / PER_MILLION,
  },
  'domo.domo_ai.domogpt-small-v1.1:anthropic': {
    inputPricePerToken: 1.04 / PER_MILLION,
    outputPricePerToken: 5.2 / PER_MILLION,
  },
  'domo.domo_ai.domogpt-small-v2.1:anthropic': {
    inputPricePerToken: 1.3 / PER_MILLION,
    outputPricePerToken: 6.5 / PER_MILLION,
  },

  // Anthropic (DomoGPT medium)
  'domo.domo_ai.domogpt-medium-v1:anthropic': {
    inputPricePerToken: 3.9 / PER_MILLION,
    outputPricePerToken: 19.5 / PER_MILLION,
  },
  'domo.domo_ai.domogpt-medium-v1.1:anthropic': {
    inputPricePerToken: 3.9 / PER_MILLION,
    outputPricePerToken: 19.5 / PER_MILLION,
  },
  'domo.domo_ai.domogpt-medium-v1.2:anthropic': {
    inputPricePerToken: 3.9 / PER_MILLION,
    outputPricePerToken: 19.5 / PER_MILLION,
  },
  'domo.domo_ai.domogpt-medium-v2:anthropic': {
    inputPricePerToken: 3.9 / PER_MILLION,
    outputPricePerToken: 19.5 / PER_MILLION,
  },
  'domo.domo_ai.domogpt-medium-v2.1:anthropic': {
    inputPricePerToken: 3.9 / PER_MILLION,
    outputPricePerToken: 19.5 / PER_MILLION,
  },
  'domo.domo_ai.domogpt-medium-v2.2:anthropic': {
    inputPricePerToken: 3.9 / PER_MILLION,
    outputPricePerToken: 19.5 / PER_MILLION,
  },

  // Anthropic (DomoGPT large)
  'domo.domo_ai.domogpt-large-v2.2:anthropic': {
    inputPricePerToken: 6.5 / PER_MILLION,
    outputPricePerToken: 32.5 / PER_MILLION,
  },

  // Cohere
  'domo.domo_ai.domo-embed-text-multilingual-v1:cohere': {
    inputPricePerToken: 0.13 / PER_MILLION,
    outputPricePerToken: 0,
  },

  // Snowflake
  'domo.snowflake.llama3.1-405b': {
    inputPricePerToken: 11.7 / PER_MILLION,
    outputPricePerToken: 11.7 / PER_MILLION,
  },
  'domo.snowflake.llama3.1-70b': {
    inputPricePerToken: 4.719 / PER_MILLION,
    outputPricePerToken: 4.719 / PER_MILLION,
  },
  'domo.snowflake.llama3.1-8b': {
    inputPricePerToken: 0.741 / PER_MILLION,
    outputPricePerToken: 0.741 / PER_MILLION,
  },
  'domo.snowflake.claude-4-sonnet': {
    inputPricePerToken: 3.9 / PER_MILLION,
    outputPricePerToken: 19.5 / PER_MILLION,
  },

  // Databricks
  'domo.databricks.llama-4-maverick': {
    inputPricePerToken: 0.65 / PER_MILLION,
    outputPricePerToken: 1.95 / PER_MILLION,
  },
  'domo.databricks.claude-sonnet-4': {
    inputPricePerToken: 3.9 / PER_MILLION,
    outputPricePerToken: 19.5 / PER_MILLION,
  },
  'domo.databricks.claude-3-7-sonnet': {
    inputPricePerToken: 3.9 / PER_MILLION,
    outputPricePerToken: 19.5 / PER_MILLION,
  },
  'domo.databricks.claude-sonnet-4.5': {
    inputPricePerToken: 3.9 / PER_MILLION,
    outputPricePerToken: 19.5 / PER_MILLION,
  },
  'domo.databricks.claude-haiku-4.5': {
    inputPricePerToken: 1.3 / PER_MILLION,
    outputPricePerToken: 6.5 / PER_MILLION,
  },

  // Google (direct)
  'domo.google.gemini-3-flash': {
    inputPricePerToken: 0.65 / PER_MILLION,
    outputPricePerToken: 3.9 / PER_MILLION,
  },
  'domo.google.gemini-3-pro': {
    inputPricePerToken: 2.6 / PER_MILLION,
    outputPricePerToken: 15.6 / PER_MILLION,
  },
  'domo.google.gemini-2.5-pro': {
    inputPricePerToken: 1.625 / PER_MILLION,
    outputPricePerToken: 13.0 / PER_MILLION,
  },
  'domo.google.gemini-2.5-flash': {
    inputPricePerToken: 0.39 / PER_MILLION,
    outputPricePerToken: 3.25 / PER_MILLION,
  },

  // Google (OCI)
  'domo.oci.google.gemini-2.5-pro': {
    inputPricePerToken: 1.625 / PER_MILLION,
    outputPricePerToken: 13.0 / PER_MILLION,
  },
  'domo.oci.google.gemini-2.5-flash': {
    inputPricePerToken: 0.39 / PER_MILLION,
    outputPricePerToken: 3.25 / PER_MILLION,
  },

  // Anthropic (direct)
  'domo.anthropic.claude-opus-4.6': {
    inputPricePerToken: 6.5 / PER_MILLION,
    outputPricePerToken: 32.5 / PER_MILLION,
  },
  'domo.anthropic.claude-sonnet-4.6': {
    inputPricePerToken: 3.9 / PER_MILLION,
    outputPricePerToken: 19.5 / PER_MILLION,
  },
  'domo.anthropic.claude-haiku-4.5': {
    inputPricePerToken: 1.3 / PER_MILLION,
    outputPricePerToken: 6.5 / PER_MILLION,
  },
};
