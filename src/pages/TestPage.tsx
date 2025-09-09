import React from 'react';
import CSSFogBackground from '../components/CSSFogBackground';

const TestPage: React.FC = () => {
  return (
    <div style={{ width: '100vw', height: '100vh', background: 'black', position: 'relative' }}>
      <CSSFogBackground />
      <div style={{ position: 'relative', zIndex: 10, padding: '20px' }}>
        <h1 style={{ color: 'white', textAlign: 'center', marginBottom: '20px' }}>
          CSS Fog Test
        </h1>
        <p style={{ color: 'white', textAlign: 'center' }}>
          You should see animated white/gray fog in the background
        </p>
      </div>
    </div>
  );
};

export default TestPage;
