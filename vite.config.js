import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import path from "path";

export default defineConfig({
    base: '/autogestion-turnos/', // 👈 Importante para que cargue correctamente en la subcarpeta
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),

    ],
    resolve: {
        alias: {
            shadcn: path.resolve(__dirname, "shadcn")
        }
    }
});
