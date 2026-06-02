import { AppCategory } from 'constants/applications';

export interface Application {
  id: string;
  name: string;
  category: AppCategory;
  description?: string;
  iconUrl?: string;
  inDock?: boolean;
  favorite?: boolean;
}
