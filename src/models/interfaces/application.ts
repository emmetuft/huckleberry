export interface Application {
  id: string;
  name: string;
  description?: string;
  iconUrl?: string;
  inDock?: boolean;
  favorite?: boolean;
}
