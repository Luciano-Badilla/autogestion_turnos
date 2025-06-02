import React from 'react';
import { createRoot } from 'react-dom/client';
import { InertiaApp } from '@inertiajs/inertia-react';

const el = document.getElementById('app');

if (el) {
  const initialPage = JSON.parse(el.dataset.page);

  const root = createRoot(el);
  root.render(
    <InertiaApp
      initialPage={initialPage}
      resolveComponent={(name) => import(`./Pages/${name}.tsx`).then((module) => module.default)}
    />
  );
}
