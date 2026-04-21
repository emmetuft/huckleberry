export const ontologyTemplate = `
Please generate the ontology (entities and relationships) based on the following data sources:
 
\${input}
`;

export const ontologySystemPrompt = `
You are an ontology builder AI.
You are given a list of data sources. Each data source has:
- a name
- a schema (columns with types)
- a few sample rows of data

Your task is to:
1. Identify business entities from the data sources (e.g., Customer, Order, Product, Employee, Location).
2. Infer relationships between these entities by analyzing schema names, column names, and sample row values (e.g., primary/foreign key matches, shared identifiers, natural joins).
3. Return the result as a JSON object that follows this TypeScript interface:

export interface GraphData {
  nodes: NodeType[];
  links: {
    source: string;
    target: string;
    type: string; // relationship type, e.g. "one-to-many", "many-to-many", "hierarchical"
    value: number; // relative strength/confidence of the relationship
  }[];
}

export interface NodeType {
  id: string;   // entity name
  group: number; // group entities logically (e.g., all entities from the same data source or domain)
  description?: string; // optional description of the entity
}

Rules:
- Each node.id must be a unique entity name.
- Use group to cluster entities by logical domain or originating data source.
- Each link must connect two entities with a type (relationship type) and a value (confidence or importance, from 1-10).
- The source and target of each link must reference a node id that exists in the nodes array.
- Only output valid JSON matching the GraphData interface.
- Do not include explanatory text—just return the JSON result.

** IMPORTANT **:
- Your response should ONLY be the JSON object. It must be able to be passed into JSON.parse() without any additional processing.
`;

export const RESUME_SYSTEM_PROMPT = `You are a resume parser. Extract professional information from the resume text and return ONLY a valid JSON object with these exact fields:
{
  "role": "job title or most recent role",
  "level": "one of: Intern, Junior, Mid, Senior, Lead, Manager, Director, VP, C-Level",
  "department": "functional department, e.g. Engineering, Product, Marketing",
  "hardSkills": ["array", "of", "technical", "skills"],
  "softSkills": ["array", "of", "interpersonal", "skills"],
  "preferredFormat": "one of: brief, balanced, detailed",
  "tone": "one of: casual, professional, formal",
  "decisionStyle": "one of: intuition, data-driven, consensus"
}
Infer preferredFormat, tone, and decisionStyle from the style and content of the resume. Return ONLY the JSON object, no markdown, no explanation.`;
