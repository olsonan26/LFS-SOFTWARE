import '@fontsource/cinzel/latin-500.css';
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './print.css';
import './components/PersonDossierPrint.css';
import './components/PersonDossierPrintFill.css';
import './components/PersonDossierSelections.css';
import './components/StudentTimelineControls.css';
import { installPrintOverrides } from './utils/installPrintOverrides';

installPrintOverrides();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);