import React, { useRef, useMemo } from 'react';
import { Canvas, extend, useFrame, useThree } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Import our GLSL shaders as raw text
import SmokeVertexShader from '../shaders/SmokeVertexShader.glsl?raw';
import SmokeFragmentShader from '../shaders/SmokeFragmentShader.glsl?raw';

// Define the custom ShaderMaterial
const SmokeMaterial = shaderMaterial(
  {
    uTime: 0,
    uResolution: new THREE.Vector2(),
    uBaseColor: new THREE.Color(0x1A1A1A),     // Very dark gray
    uMidColor: new THREE.Color(0x808080),      // Medium gray
    uHighlightColor: new THREE.Color(0xFFFFFF) // White
  },
  SmokeVertexShader,
  SmokeFragmentShader
);

// Extend Three.js so we can use <smokeMaterial> JSX element
extend({ SmokeMaterial });

// TypeScript declarations for the extended material
declare global {
  namespace JSX {
    interface IntrinsicElements {
      smokeMaterial: any;
    }
  }
}

// Component for the smoke plane
const SmokePlane = () => {
  const materialRef = useRef<any>();
  const { viewport } = useThree();

  // Update uTime and uResolution every frame
  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uTime = clock.getElapsedTime();
      materialRef.current.uResolution.set(viewport.width * viewport.dpr, viewport.height * viewport.dpr);
    }
  });

  // Calculate plane dimensions to cover the screen
  const width = viewport.width;
  const height = viewport.height;

  return (
    <mesh scale={[width, height, 1]}>
      <planeGeometry args={[1, 1]} />
      <smokeMaterial ref={materialRef} side={THREE.DoubleSide} transparent />
    </mesh>
  );
};

// Main AnimatedSmokeBackground component
const AnimatedSmokeBackground: React.FC = () => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none',
      }}
    >
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 1], fov: 75 }}
        linear
      >
        <SmokePlane />
      </Canvas>
    </div>
  );
};

export default AnimatedSmokeBackground;