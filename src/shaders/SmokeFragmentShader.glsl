precision highp float; // Use high precision for better quality

uniform float uTime;
uniform vec3 uBaseColor;
uniform vec3 uMidColor;
uniform vec3 uHighlightColor;
uniform vec2 uResolution; // For adapting coordinates

varying vec2 vUv;
varying vec3 vPosition;

// Simplex noise function (simplified for testing)
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

// Fractal Brownian Motion for complex patterns
float fbm(vec2 p) {
    float f = 0.0;
    f += 0.5   * noise(p);
    f += 0.25  * noise(p * 2.0);
    f += 0.125 * noise(p * 4.0);
    f += 0.0625 * noise(p * 8.0);
    return f / (0.5 + 0.25 + 0.125 + 0.0625);
}

void main() {
    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    
    // Create animated fog effect
    vec2 p = uv * 3.0;
    p += uTime * 0.1;
    
    float n1 = noise(p);
    float n2 = noise(p * 2.0 + uTime * 0.2);
    float n3 = noise(p * 4.0 + uTime * 0.3);
    
    float density = (n1 + n2 * 0.5 + n3 * 0.25) / 1.75;
    density = pow(density, 1.5);
    
    // Create swirling motion
    vec2 swirl = vec2(
        sin(uv.y * 3.14159 + uTime * 0.5) * 0.1,
        cos(uv.x * 3.14159 + uTime * 0.3) * 0.1
    );
    density += noise(uv * 2.0 + swirl + uTime * 0.1) * 0.3;
    
    density = clamp(density, 0.0, 1.0);
    
    // Map to colors
    vec3 color = mix(uBaseColor, uMidColor, density);
    color = mix(color, uHighlightColor, smoothstep(0.6, 1.0, density));
    
    float alpha = density * 0.7;
    alpha = clamp(alpha, 0.0, 0.8);
    
    gl_FragColor = vec4(color, alpha);
}