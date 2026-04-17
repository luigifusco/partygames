import { useEffect, useRef } from 'react';

/* ─── Background presets ──────────────────────────────────────────
 * Each preset drives the same shader with different colour palettes
 * and flow parameters so every stage feels distinct while keeping
 * a coherent, subdued aesthetic.
 *
 * Colors are stored as 0-1 RGB triplets (three stops per palette).
 * flow    : speed & direction of the noise field (very slow)
 * scale   : noise frequency (lower = bigger, calmer blobs)
 * warp    : how much a second noise layer distorts the first
 * contrast: multiplier applied to the shaped noise value (< 1 = softer)
 */
export interface BackgroundPreset {
  id: string;
  label: string;
  palette: [number, number, number][];
  scale: number;
  warp: number;
  contrast: number;
  flow: [number, number];
}

const hex = (h: string): [number, number, number] => {
  const n = parseInt(h.replace('#', ''), 16);
  return [((n >> 16) & 0xff) / 255, ((n >> 8) & 0xff) / 255, (n & 0xff) / 255];
};

export const BACKGROUND_PRESETS: BackgroundPreset[] = [
  {
    id: 'twilight-meadow',
    label: 'Twilight Meadow',
    palette: [hex('#0e1440'), hex('#5d3a8a'), hex('#f3b6c8')],
    scale: 2.2,
    warp: 0.35,
    contrast: 0.95,
    flow: [0.008, 0.004],
  },
  {
    id: 'misty-forest',
    label: 'Misty Forest',
    palette: [hex('#0b241f'), hex('#2e7d6a'), hex('#e0f2a3')],
    scale: 2.6,
    warp: 0.45,
    contrast: 0.9,
    flow: [-0.006, 0.003],
  },
  {
    id: 'ember-fields',
    label: 'Ember Fields',
    palette: [hex('#2a0606'), hex('#a83220'), hex('#ffd27a')],
    scale: 2.4,
    warp: 0.6,
    contrast: 1.1,
    flow: [0.004, -0.01],
  },
  {
    id: 'frozen-lake',
    label: 'Frozen Lake',
    palette: [hex('#07132e'), hex('#3a7aa8'), hex('#d8f1ff')],
    scale: 2.0,
    warp: 0.25,
    contrast: 0.8,
    flow: [0.006, 0.002],
  },
  {
    id: 'dune-haze',
    label: 'Dune Haze',
    palette: [hex('#3b270e'), hex('#c88a4b'), hex('#fde5b8')],
    scale: 1.8,
    warp: 0.4,
    contrast: 0.85,
    flow: [-0.009, 0.002],
  },
  {
    id: 'deep-cosmos',
    label: 'Deep Cosmos',
    palette: [hex('#05020d'), hex('#4c268f'), hex('#6ed7ff')],
    scale: 3.0,
    warp: 0.6,
    contrast: 1.05,
    flow: [0.003, 0.005],
  },
  {
    id: 'ocean-drift',
    label: 'Ocean Drift',
    palette: [hex('#041a2e'), hex('#0e6b8a'), hex('#b4f0d8')],
    scale: 2.2,
    warp: 0.5,
    contrast: 0.9,
    flow: [0.01, 0.002],
  },
  {
    id: 'blossom-mist',
    label: 'Blossom Mist',
    palette: [hex('#2a0e1c'), hex('#a05175'), hex('#ffe1d0')],
    scale: 2.2,
    warp: 0.35,
    contrast: 0.85,
    flow: [-0.005, -0.004],
  },
  {
    id: 'toxic-swamp',
    label: 'Toxic Swamp',
    palette: [hex('#0d0a1a'), hex('#385a26'), hex('#c8ff72')],
    scale: 2.5,
    warp: 0.7,
    contrast: 1.0,
    flow: [0.007, -0.003],
  },
  {
    id: 'dusk-plains',
    label: 'Dusk Plains',
    palette: [hex('#1d0b2c'), hex('#a04a6c'), hex('#ffc06e')],
    scale: 2.0,
    warp: 0.4,
    contrast: 0.95,
    flow: [0.005, 0.003],
  },
];

export function pickPreset(seed?: string): BackgroundPreset {
  if (!seed) return BACKGROUND_PRESETS[Math.floor(Math.random() * BACKGROUND_PRESETS.length)];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return BACKGROUND_PRESETS[Math.abs(h) % BACKGROUND_PRESETS.length];
}

/* ─── Shader sources ─────────────────────────────────────────── */

const VERT = `
attribute vec2 a_pos;
void main(){ gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAG = `
precision mediump float;
uniform float u_time;
uniform vec2  u_res;
uniform vec3  u_c1, u_c2, u_c3;
uniform float u_scale;
uniform float u_warp;
uniform float u_contrast;
uniform vec2  u_flow;

/* 2D Simplex noise (Ashima Arts, MIT) */
vec3 permute(vec3 x){ return mod(((x*34.0)+1.0)*x, 289.0); }
float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                     -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                 + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m; m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main(){
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 aspect = vec2(u_res.x / u_res.y, 1.0);
  vec2 p = (uv - 0.5) * aspect * u_scale;

  /* warp layer pushes around the base field for psychedelic feel */
  vec2 warp = vec2(
    snoise(p * 0.6 + u_flow * u_time * 60.0),
    snoise(p * 0.6 + u_flow * u_time * 60.0 + 31.7)
  ) * u_warp;

  vec2 q = p + warp + u_flow * u_time * 40.0;
  float n1 = snoise(q);
  float n2 = snoise(q * 1.9 + 12.3);
  float v = 0.6 * n1 + 0.4 * n2;
  v = clamp(v * u_contrast, -1.0, 1.0);
  v = v * 0.5 + 0.5;

  vec3 col = mix(u_c1, u_c2, smoothstep(0.0, 0.5, v));
  col = mix(col, u_c3, smoothstep(0.5, 1.0, v));

  /* subtle horizontal bands like an old CRT scanline pass */
  float scan = 0.5 + 0.5 * sin(gl_FragCoord.y * 0.8);
  col *= 0.97 + 0.03 * scan;

  /* soft vignette so sprites always pop */
  float vig = smoothstep(1.25, 0.35, length(uv - 0.5));
  col *= 0.55 + 0.45 * vig;

  gl_FragColor = vec4(col, 1.0);
}
`;

/* ─── Component ───────────────────────────────────────────────── */

interface Props {
  preset?: BackgroundPreset;
  seed?: string;
  className?: string;
}

export default function BattleBackground({ preset, seed, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chosen = preset ?? pickPreset(seed);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: false, alpha: false });
    if (!gl) {
      // Fallback: solid first palette colour; no animation
      canvas.style.background = `rgb(${chosen.palette[0].map(c => Math.round(c * 255)).join(',')})`;
      return;
    }

    const compile = (src: string, type: number) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(sh));
      }
      return sh;
    };

    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(VERT, gl.VERTEX_SHADER));
    gl.attachShader(prog, compile(FRAG, gl.FRAGMENT_SHADER));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uTime     = gl.getUniformLocation(prog, 'u_time');
    const uRes      = gl.getUniformLocation(prog, 'u_res');
    const uC1       = gl.getUniformLocation(prog, 'u_c1');
    const uC2       = gl.getUniformLocation(prog, 'u_c2');
    const uC3       = gl.getUniformLocation(prog, 'u_c3');
    const uScale    = gl.getUniformLocation(prog, 'u_scale');
    const uWarp     = gl.getUniformLocation(prog, 'u_warp');
    const uContrast = gl.getUniformLocation(prog, 'u_contrast');
    const uFlow     = gl.getUniformLocation(prog, 'u_flow');

    gl.uniform3fv(uC1, chosen.palette[0]);
    gl.uniform3fv(uC2, chosen.palette[1]);
    gl.uniform3fv(uC3, chosen.palette[2]);
    gl.uniform1f(uScale, chosen.scale);
    gl.uniform1f(uWarp, chosen.warp);
    gl.uniform1f(uContrast, chosen.contrast);
    gl.uniform2fv(uFlow, chosen.flow);

    let raf = 0;
    const start = performance.now();
    // downscale for perf — shader interpolates smoothly anyway
    const DPR_CAP = Math.min(window.devicePixelRatio || 1, 1.25);

    const resize = () => {
      const w = Math.max(1, Math.floor(canvas.clientWidth  * 0.5 * DPR_CAP));
      const h = Math.max(1, Math.floor(canvas.clientHeight * 0.5 * DPR_CAP));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
        gl.uniform2f(uRes, w, h);
      }
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const tick = () => {
      const t = (performance.now() - start) / 1000;
      gl.uniform1f(uTime, t);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [chosen]);

  return <canvas ref={canvasRef} className={`battle-bg-canvas ${className ?? ''}`} aria-hidden="true" />;
}
