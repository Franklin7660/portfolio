/* shader disabled - replaced by CSS canvas background */

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    mat2 m = mat2(1.6, -1.2, 1.2, 1.6);
    for (int i = 0; i < 4; i++) {
        value += amplitude * noise(p);
        p = m * p;
        amplitude *= 0.5;
    }
    return value;
}

float starLayer(vec2 uv, float zoom) {
    vec2 grid = uv * zoom;
    vec2 id = floor(grid);
    // wrap id to a smaller range to avoid floating-point precision loss for large coordinates
    id = mod(id, vec2(256.0));
    vec2 gv = fract(grid) - 0.5;
    float rnd = hash(id);
    // Gentler falloff and lower exponent so stars remain bright enough to be visible
    float star = max(0.0, 1.0 - dot(gv, gv) * 6.0);
    star = pow(star, 2.0);
    float twinkle = 0.5 + 0.5 * sin(u_time * (3.0 + rnd * 5.0) + rnd * 6.2831853);
    // widen mask so more cells can host stars
    float mask = smoothstep(0.9, 1.0, rnd);
    return star * twinkle * mask;
}

vec4 frag(vec2 pos, vec2 uv, vec4 color, sampler2D tex) {
    vec2 centered = uv - 0.5;
    centered.x *= u_aspect;

    float size = clamp(u_size, 0.0, 1.0);
    vec2 driftUv = uv + u_speed * u_time * 0.15;

    float neb = fbm(centered * mix(1.4, 3.6, size) + u_time * 0.05);
    // use a gentler mapping so small fbm values are visible in debug
    float neb_smooth = smoothstep(0.0, 0.6, neb);

    float stars = starLayer(driftUv, mix(18.0, 36.0, size));
    stars += 0.5 * starLayer(driftUv * 1.7 + 13.0, 55.0);

    // QUICK DEBUG: inspect per-cell rnd / mask / star values directly
    float gridZoom = mix(18.0, 36.0, size);
    vec2 grid = driftUv * gridZoom;
    vec2 id = floor(grid);
    vec2 gv = fract(grid) - 0.5;

    // Deterministic selector (no external hash) to force some cells to host stars
    float selector = fract(sin(dot(id, vec2(12.9898,78.233))) * 43758.5453);
    // spot intensity falls off from cell center; use a robust expression (avoid inverted smoothstep)
    float spot = max(0.0, 1.0 - length(gv) * 12.0);
    // lower threshold so more cells can host stars
    float cellMask = step(0.6, selector);

    // final star value with twinkle driven by time
    float twinkle = 0.5 + 0.5 * sin(u_time * (3.0 + selector * 10.0));
    float starval = spot * twinkle * cellMask;

    vec3 spaceColor = vec3(0.01, 0.01, 0.03);
    // Use hardcoded colors to rule out uniform-format issues
    vec3 c1 = vec3(0.55, 0.20, 1.00);
    vec3 c2 = vec3(0.10, 0.75, 1.00);
    vec3 nebulaColor = mix(c1, c2, neb_smooth);
    vec3 base = spaceColor + nebulaColor * neb_smooth * 0.8;

    float baseBright = length(base);

    // Debug composite now shows: R = selector, G = cellMask, B = starval
    return vec4(clamp(selector, 0.0, 1.0), clamp(cellMask, 0.0, 1.0), clamp(starval * 50.0, 0.0, 1.0), 1.0);
}
