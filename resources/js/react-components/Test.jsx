import React from 'react';
import {createRoot} from 'react-dom/client';

export default function Test() {
    return (
        <div>
            <h1>Test</h1>
        </div>
    );
}

const root = createRoot(document.getElementById('root'));
root.render(<Test />);      