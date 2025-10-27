export interface Integration {
  id: string;
  name: string;
  description?: string;
  iconUrl?: string;
  category: string;
  connected?: boolean;
}
