/* shader disabled - replaced by CSS canvas background */

vec4 frag(vec2 pos, vec2 uv, vec4 color, sampler2D tex) {
    // center coords and preserve aspect
    vec2 c = uv - 0.5;
    c.x *= u_aspect;

    // a simple radial ripple + time-based color mix
    float dist = length(c);
    float ripple = 0.5 + 0.5 * sin(dist * 12.0 - u_time * 2.0);
    float mixT = 0.5 + 0.5 * sin(u_time * 0.5);

    // ensure a visible base brightness and clamp final color
    vec3 col = mix(u_color1, u_color2, mixT) * (0.6 + 0.6 * ripple);
    col = clamp(col, 0.0, 1.0);
    return vec4(col, 1.0);
}
