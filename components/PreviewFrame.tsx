import React, { useEffect, useRef } from 'react';

interface PreviewFrameProps {
  code: string;
  refreshTrigger: number;
}

const PreviewFrame: React.FC<PreviewFrameProps> = ({ code, refreshTrigger }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!iframeRef.current) return;

    // We construct a complete HTML document that includes React, ReactDOM, and Babel standalone.
    // This allows us to "compile" and run the generated JSX client-side within the iframe.
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script src="https://cdn.tailwindcss.com"></script>
        <!-- React & ReactDOM -->
        <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
        <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
        <!-- Babel for JSX compilation -->
        <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
        <!-- Lucide Icons -->
        <script src="https://unpkg.com/lucide@latest"></script>
        <script src="https://unpkg.com/lucide-react/dist/lucide-react.min.js"></script>
        <!-- Recharts (Optional support) -->
        <script src="https://unpkg.com/recharts/umd/Recharts.js"></script>
        
        <style>
          body { background-color: #ffffff; color: #1f2937; margin: 0; padding: 0; }
          #root { min-height: 100vh; }
        </style>
      </head>
      <body>
        <div id="root"></div>
        <script type="text/babel" data-presets="env,react">
          const { useState, useEffect, useRef, useMemo, useCallback } = React;
          
          // Shim for imports since we are in a simple script tag environment
          // We define a simple 'require' or just map window globals to expected import names
          
          // Mocking lucide-react icons availability
          const LucideIcons = window.lucide ? window.lucide.icons : {};
          
          // We wrap the user code in a function to avoid global scope pollution issues, 
          // but we need to handle the 'export default' or 'export' syntax which Babel standalone doesn't love in scripts.
          // Strategy: We will strip 'export default' and just mount the last defined function or a specific name.
          
          ${code.replace(/import .* from .*/g, '// $&')
               .replace(/export default/g, 'const App =')
               .replace(/export /g, '')}

          // Mount logic
          const rootElement = document.getElementById('root');
          const root = ReactDOM.createRoot(rootElement);
          
          // Try to find the component named App, or fallback to the last defined function if possible (simplified here)
          if (typeof App !== 'undefined') {
             root.render(<App />);
          } else {
             rootElement.innerHTML = '<div class="p-4 text-red-500">Error: Could not find component "App". Please ensure the code defines "const App" or "export default function App".</div>';
          }
        </script>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    iframeRef.current.src = url;

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [code, refreshTrigger]);

  return (
    <div className="w-full h-full bg-white rounded-md overflow-hidden shadow-inner border border-gray-700">
      <iframe
        ref={iframeRef}
        title="App Preview"
        className="w-full h-full border-none"
        sandbox="allow-scripts allow-same-origin allow-modals allow-popups"
      />
    </div>
  );
};

export default PreviewFrame;
