// app.js
import React from 'react';
import { createRoot } from 'react-dom/client';
import {AppointmentForm} from './views/AppointmentForm'; // Importamos el componente 

const rootElement = document.getElementById('root'); // Donde se montará el componente
const root = createRoot(rootElement);

root.render(<AppointmentForm />); // Aquí renderizamos el componente
