import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import { store } from 'reducers/index.ts';
import { AppRouter } from './AppRouter.tsx';

import {
  AllCommunityModule,
  CustomFilterModule,
  ModuleRegistry,
} from 'ag-grid-community';

import './index.css';

ModuleRegistry.registerModules([AllCommunityModule, CustomFilterModule]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);
