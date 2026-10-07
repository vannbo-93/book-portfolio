/** @format */
import { useEffect, useRef, type FC } from "react";
import { Renderer, Program, Mesh, Triangle } from "ogl";

// تعديلات على النسخة الأصلية حتى تعمل كخلفية ثابتة تملأ الصفحة:
// 1. يستمع للماوس على window، فيعمل التأثير والمحتوى فوقه
// 2. dpr قابل للضبط (افتراضيًا 1 بدل حتى 2): الـ shader يحسب حتى 70 خطوة لكل بكسل،
//    ومضاعفة الدقة تعني أربعة أضعاف العمل
// 3. fps قابل للضبط (افتراضيًا 30): الأمواج بطيئة ولا يُلاحظ الفرق عن 60
// 4. يحترم تقليل الحركة: إطار ثابت بدل الحركة
// 5. يتوقف بهدوء إن لم يتوفر WebGL 2 بدل أن يُسقط الصفحة
// 6. الألوان والإعدادات تُطبَّق قبل أول رسم، فلا يظهر إطار أبيض عند التحميل

export type GradientWavesDetail = "low" | "medium" | "high";

export interface GradientWavesProps {
  horizonColor?: string;
  waveColor?: string;
  crestColor?: string;
  speed?: number;
  amplitude?: number;
  waveScale?: number;
  waveRatio?: number;
  swell?: number;
  turbulence?: number;
  tilt?: number;
  zoom?: number;
  height?: number;
  fogDepth?: number;
  detail?: GradientWavesDetail;
  brightness?: number;
  opacity?: number;
  mouseInteraction?: boolean;
  parallaxStrength?: number;
  grain?: boolean;
  grainIntensity?: number;
  dpr?: number;
  fps?: number;
  className?: string;
}

type Settings = Required<Omit<GradientWavesProps, "className" | "dpr">>;

type Uniform<T> = { value: T };

const hexToRgb = (hex: string): [number, number, number] => {
  const value = hex.trim().replace(/^#/, "");
  const full =
    value.length === 3 ? value.replace(/./g, (ch) => ch + ch) : value;
  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(full);
  if (!result) return [1, 1, 1];
  return [
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255,
  ];
};

const setColor = (uniform: Uniform<Float32Array>, hex: string) => {
  const [r, g, b] = hexToRgb(hex);
  uniform.value[0] = r;
  uniform.value[1] = g;
  uniform.value[2] = b;
};

const detailToSteps = (detail: GradientWavesDetail): number => {
  if (detail === "low") return 40.0;
  if (detail === "high") return 110.0;
  return 70.0;
};

const vertex = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragment = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uSpeed;
uniform float uAmplitude;
uniform float uWaveScale;
uniform float uWaveRatio;
uniform float uSwell;
uniform float uTurbulence;
uniform float uTilt;
uniform float uZoom;
uniform float uHeight;
uniform float uFogDepth;
uniform float uSteps;
uniform float uBrightness;
uniform float uOpacity;
uniform float uGrain;
uniform float uGrainIntensity;
uniform vec2 uMouse;
uniform float uParallax;
uniform bool uEnableMouse;
uniform vec3 uHorizonColor;
uniform vec3 uWaveColor;
uniform vec3 uCrestColor;
out vec4 fragColor;

const float MAX_DIST = 20000.0;

float hash21(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float plasma(vec3 r, vec2 freq, vec4 tc) {
  float mx = r.x + tc.x;
  mx += uSwell * sin((r.y + mx) / 20.0 + tc.y);
  float my = r.y - tc.z;
  my += uTurbulence * cos(r.x / 23.0 + tc.w);
  return r.z - (sin(mx * freq.x) * uAmplitude + sin(my * freq.y) * uAmplitude + uHeight);
}

float raymarch(vec3 pos, vec3 dir, vec2 freq, vec4 tc) {
  float dist = 0.0;
  for (int i = 0; i < 128; i++) {
    if (float(i) >= uSteps) break;
    float dscene = plasma(pos + dist * dir, freq, tc);
    if (abs(dscene) < 0.1) break;
    dist += 0.9 * dscene;
    if (!(abs(dist) < MAX_DIST)) return MAX_DIST;
  }
  return dist;
}

void main() {
  float T = iTime * uSpeed;
  vec2 freq = vec2(uWaveScale / 7.0, (uWaveScale * uWaveRatio) / 3.0);
  vec4 tc = vec4(T / 0.130, T / 0.810, T / 0.200, T / 0.710);
  float c, s;
  float vfov = (3.14159 / 2.3) / max(uZoom, 0.05);
  vec3 cam = vec3(0.0, 0.0, 30.0);
  vec2 uv = (gl_FragCoord.xy / iResolution.xy) - 0.5;
  uv.x *= iResolution.x / iResolution.y;
  uv.y *= -1.0;

  vec3 dir = vec3(0.0, 0.0, -1.0);
  float ulen = length(uv);
  float xrot = vfov * ulen;
  c = cos(xrot); s = sin(xrot);
  dir = mat3(1.0, 0.0, 0.0, 0.0, c, -s, 0.0, s, c) * dir;
  vec2 nuv = ulen > 1e-5 ? uv / ulen : vec2(1.0, 0.0);
  c = nuv.x; s = nuv.y;
  dir = mat3(c, -s, 0.0, s, c, 0.0, 0.0, 0.0, 1.0) * dir;
  c = cos(uTilt); s = sin(uTilt);
  dir = mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c) * dir;

  if (uEnableMouse) {
    float yaw = (uMouse.x - 0.5) * uParallax * 0.4;
    float pitch = (uMouse.y - 0.5) * uParallax * 0.4;
    c = cos(yaw); s = sin(yaw);
    dir = mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c) * dir;
    c = cos(pitch); s = sin(pitch);
    dir = mat3(1.0, 0.0, 0.0, 0.0, c, -s, 0.0, s, c) * dir;
  }

  float dist = raymarch(cam, dir, freq, tc);
  vec3 pos = cam + dist * dir;

  float t = clamp(uFogDepth / max(dist, 0.001), 0.0, 1.0);
  vec3 body = mix(uWaveColor, uCrestColor, clamp(pos.z * 0.08 + 0.5, 0.0, 1.0));
  vec3 col = mix(uHorizonColor, body, t);
  col *= uBrightness;
  col = clamp(col, 0.0, 1.0);

  float alpha = clamp(t, 0.0, 1.0) * uOpacity;
  if (uGrain > 0.5) {
    float g = hash21(gl_FragCoord.xy + mod(iTime, 64.0) * 11.0);
    alpha += (g - 0.5) * uGrainIntensity;
  }
  alpha = clamp(alpha, 0.0, 1.0);
  fragColor = vec4(col * alpha, alpha);
}
`;

const GradientWaves: FC<GradientWavesProps> = ({
  horizonColor = "#5227FF",
  waveColor = "#FF9FFC",
  crestColor = "#FFFFFF",
  speed = 0.4,
  amplitude = 2.5,
  waveScale = 0.6,
  waveRatio = 0.9,
  swell = 35,
  turbulence = 20,
  tilt = 1.11,
  zoom = 1.0,
  height = 5.5,
  fogDepth = 15,
  detail = "medium",
  brightness = 1.0,
  opacity = 1.0,
  mouseInteraction = true,
  parallaxStrength = 0.5,
  grain = true,
  grainIntensity = 0.05,
  dpr = 1,
  fps = 30,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const settings: Settings = {
    horizonColor,
    waveColor,
    crestColor,
    speed,
    amplitude,
    waveScale,
    waveRatio,
    swell,
    turbulence,
    tilt,
    zoom,
    height,
    fogDepth,
    detail,
    brightness,
    opacity,
    mouseInteraction,
    parallaxStrength,
    grain,
    grainIntensity,
    fps,
  };
  const settingsRef = useRef<Settings>(settings);
  const applyRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    // إن لم يتوفر WebGL نتوقف بهدوء، فيبقى لون الخلفية وحده
    let renderer: InstanceType<typeof Renderer>;
    try {
      renderer = new Renderer({
        webgl: 2,
        alpha: true,
        premultipliedAlpha: true,
        antialias: false,
        dpr: Math.min(
          window.devicePixelRatio || 1,
          Math.min(Math.max(dpr, 0.25), 2),
        ),
      });
    } catch {
      return;
    }
    if (!renderer.gl) return;

    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    const canvas = gl.canvas as HTMLCanvasElement;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    canvas.setAttribute("aria-hidden", "true");
    container.appendChild(canvas);

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new Float32Array([1, 1]) },
        uSpeed: { value: 0.4 },
        uAmplitude: { value: 2.5 },
        uWaveScale: { value: 0.6 },
        uWaveRatio: { value: 0.9 },
        uSwell: { value: 35 },
        uTurbulence: { value: 20 },
        uTilt: { value: 1.11 },
        uZoom: { value: 1.0 },
        uHeight: { value: 5.5 },
        uFogDepth: { value: 15 },
        uSteps: { value: 70.0 },
        uBrightness: { value: 1.0 },
        uOpacity: { value: 1.0 },
        uGrain: { value: 1.0 },
        uGrainIntensity: { value: 0.05 },
        uMouse: { value: new Float32Array([0.5, 0.5]) },
        uParallax: { value: 0.5 },
        uEnableMouse: { value: true },
        uHorizonColor: { value: new Float32Array([1, 1, 1]) },
        uWaveColor: { value: new Float32Array([1, 1, 1]) },
        uCrestColor: { value: new Float32Array([1, 1, 1]) },
      },
    });
    const mesh = new Mesh(gl, { geometry, program });
    const u = program.uniforms as Record<string, Uniform<unknown>>;

    let raf = 0;
    let lastRender = 0;
    let isVisible = true;
    let isPageVisible = !document.hidden;
    const t0 = performance.now();

    const render = () => renderer.render({ scene: mesh });
    const canAnimate = () =>
      isVisible && isPageVisible && !reducedMotion.matches;

    // ينقل الإعدادات الحالية إلى الـ shader. إن كانت الحركة متوقفة نرسم إطارًا واحدًا ليظهر التغيير
    const apply = () => {
      const s = settingsRef.current;
      u.uSpeed.value = s.speed;
      u.uAmplitude.value = s.amplitude;
      u.uWaveScale.value = s.waveScale;
      u.uWaveRatio.value = s.waveRatio;
      u.uSwell.value = s.swell;
      u.uTurbulence.value = s.turbulence;
      u.uTilt.value = s.tilt;
      u.uZoom.value = s.zoom;
      u.uHeight.value = s.height;
      u.uFogDepth.value = s.fogDepth;
      u.uSteps.value = detailToSteps(s.detail);
      u.uBrightness.value = s.brightness;
      u.uOpacity.value = s.opacity;
      u.uGrain.value = s.grain ? 1.0 : 0.0;
      u.uGrainIntensity.value = s.grainIntensity;
      u.uParallax.value = s.parallaxStrength;
      u.uEnableMouse.value = s.mouseInteraction && !reducedMotion.matches;
      setColor(u.uHorizonColor as Uniform<Float32Array>, s.horizonColor);
      setColor(u.uWaveColor as Uniform<Float32Array>, s.waveColor);
      setColor(u.uCrestColor as Uniform<Float32Array>, s.crestColor);
      if (raf === 0) render();
    };
    applyRef.current = apply;

    const setSize = () => {
      const rect = container.getBoundingClientRect();
      renderer.setSize(
        Math.max(1, Math.floor(rect.width)),
        Math.max(1, Math.floor(rect.height)),
      );
      const res = (u.iResolution as Uniform<Float32Array>).value;
      res[0] = gl.drawingBufferWidth;
      res[1] = gl.drawingBufferHeight;
      render();
    };

    const currentMouse: [number, number] = [0.5, 0.5];
    const targetMouse: [number, number] = [0.5, 0.5];

    // الماوس يتحرك فوق المحتوى لا فوق الخلفية، فنستمع على window
    // ونحسب موضعه نسبةً إلى طبقة الخلفية في الشاشة
    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      targetMouse[0] = (e.clientX - rect.left) / Math.max(1, rect.width);
      targetMouse[1] = 1.0 - (e.clientY - rect.top) / Math.max(1, rect.height);
    };
    const onPointerLeave = () => {
      targetMouse[0] = 0.5;
      targetMouse[1] = 0.5;
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);

      // تحديد عدد الإطارات في الثانية
      const fpsCap = Math.min(Math.max(settingsRef.current.fps, 1), 60);
      if (now - lastRender < 1000 / fpsCap - 0.5) return;
      lastRender = now;

      u.iTime.value = (now - t0) * 0.001;
      const follow = settingsRef.current.mouseInteraction;
      const tx = follow ? targetMouse[0] : 0.5;
      const ty = follow ? targetMouse[1] : 0.5;
      currentMouse[0] += 0.05 * (tx - currentMouse[0]);
      currentMouse[1] += 0.05 * (ty - currentMouse[1]);
      const m = (u.uMouse as Uniform<Float32Array>).value;
      m[0] = currentMouse[0];
      m[1] = currentMouse[1];
      render();
    };

    const start = () => {
      if (canAnimate() && raf === 0) raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      if (raf !== 0) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };
    const refresh = () => {
      if (canAnimate()) start();
      else {
        stop();
        apply();
      }
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        refresh();
      },
      { threshold: 0 },
    );
    const onVisibility = () => {
      isPageVisible = !document.hidden;
      refresh();
    };

    const ro = new ResizeObserver(setSize);

    apply();
    ro.observe(container);
    setSize();
    io.observe(container);
    document.addEventListener("visibilitychange", onVisibility);
    reducedMotion.addEventListener("change", refresh);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave);
    start();

    return () => {
      stop();
      applyRef.current = null;
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      reducedMotion.removeEventListener("change", refresh);
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener(
        "pointerleave",
        onPointerLeave,
      );
      if (canvas.parentNode === container) container.removeChild(canvas);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [dpr]);

  // بعد كل render: نحفظ الإعدادات الحالية ونطبّقها على الـ shader (عملية رخيصة)
  useEffect(() => {
    settingsRef.current = settings;
    applyRef.current?.();
  });

  return (
    <div
      ref={containerRef}
      className={`relative h-full w-full overflow-hidden ${className}`.trim()}
    />
  );
};

export default GradientWaves;
