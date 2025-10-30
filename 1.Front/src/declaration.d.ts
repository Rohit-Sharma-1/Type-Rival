declare module '*.jsx' {
  import React from 'react';
  const component: React.FC<Record<string, unknown>>;
  export default component;
}

// Allow importing that specific Ribbons.jsx file
declare module '*/Ribbons.jsx' {
  import React from 'react';
  const Ribbons: React.FC<Record<string, unknown>>;
  export default Ribbons;
}
