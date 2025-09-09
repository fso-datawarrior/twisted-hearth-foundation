varying vec2 vUv;
varying vec3 vPosition;

void main() {
    vUv = uv; // Pass texture coordinates
    vPosition = position; // Pass vertex position
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}