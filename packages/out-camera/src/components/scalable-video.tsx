"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

type TapPayload = { x: number; y: number; imageData: ImageData };

type CameraLayout = {
  cw: number;
  ch: number;
  dpr: number;
  sx: number;
  sy: number;
  sw: number;
  sh: number;
};

type ReloadPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";

type Props = {
  stream: MediaStream;
  width?: number | string;
  height?: number | string;
  className?: string;
  overscan?: number;
  onTap?: (data: TapPayload) => void;
  reloadPos?: ReloadPosition;
  reloadIcon?: React.ReactNode;
  onReload?: () => void;
};

const VS_300 = `#version 300 es
precision highp float;
uniform vec4 u_uvRect;
out vec2 v_uv;
void main() {
  vec2 pos = (gl_VertexID == 0) ? vec2(-1.0, -1.0)
            : (gl_VertexID == 1) ? vec2( 3.0, -1.0)
                                  : vec2(-1.0,  3.0);
  gl_Position = vec4(pos, 0.0, 1.0);
  vec2 base = pos * 0.5 + 0.5;
  v_uv = mix(u_uvRect.xy, u_uvRect.zw, base);
}`;

const FS_300 = `#version 300 es
precision highp float;
in vec2 v_uv;
uniform sampler2D u_texture;
out vec4 outColor;
void main() {
  outColor = texture(u_texture, v_uv);
}`;

const DefaultReloadIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
  </svg>
);

export function WebGLCanvasCamera({
  stream,
  width = "100%",
  height = "100%",
  className = "",
  overscan = 1.0,
  onTap,
  reloadPos = "top-right",
  reloadIcon,
  onReload,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reloadButtonRef = useRef<HTMLButtonElement>(null);

  const glRef = useRef<WebGL2RenderingContext | null>(null);
  const progRef = useRef<WebGLProgram | null>(null);
  const vaoRef = useRef<WebGLVertexArrayObject | null>(null);
  const texRef = useRef<WebGLTexture | null>(null);
  const uUVRectRef = useRef<WebGLUniformLocation | null>(null);

  const [meta, setMeta] = useState<{ vw: number; vh: number } | null>(null);
  const [isReloading, setIsReloading] = useState(false);

  const layoutRef = useRef<CameraLayout | null>(null);
  const cachedRef = useRef({ cw: 0, ch: 0, dpr: 1 });
  const pixRef = useRef({ w: 0, h: 0 });
  const allocTexRef = useRef<{ w: number; h: number } | null>(null);
  const isRenderingRef = useRef(true);
  const contextLostRef = useRef(false);

  // ★ スナップショット要求フラグ（同一フレーム内読み取り用）
  const snapshotRequestedRef = useRef(false);
  const snapshotCoordsRef = useRef<{ cx: number; cy: number } | null>(null);

  const zoomStateRef = useRef<{
    supported: boolean;
    min: number;
    max: number;
    step: number;
    value: number;
  }>({ supported: false, min: 1, max: 1, step: 0.01, value: 1 });

  const desiredZoomRef = useRef<number | null>(null);
  const zoomApplyScheduledRef = useRef(false);

  const TAP_MAX_DIST = 5;
  const TAP_MAX_MS = 250;
  const tapCandidateRef = useRef<{
    id: number;
    x: number;
    y: number;
    t: number;
  } | null>(null);

  const getReloadButtonStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      position: "absolute",
      zIndex: 10,
      padding: "8px",
      background: "rgba(0, 0, 0, 0.4)",
      border: "none",
      borderRadius: "50%",
      color: "white",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.2s ease",
      backdropFilter: "blur(4px)",
      pointerEvents: "auto",
    };

    switch (reloadPos) {
      case "top-left":
        return { ...baseStyle, top: "12px", left: "12px" };
      case "top-right":
        return { ...baseStyle, top: "12px", right: "12px" };
      case "bottom-left":
        return { ...baseStyle, bottom: "12px", left: "12px" };
      case "bottom-right":
        return { ...baseStyle, bottom: "12px", right: "12px" };
      default:
        return { ...baseStyle, display: "none" };
    }
  };

  const isPointInReloadButton = useCallback(
    (clientX: number, clientY: number): boolean => {
      if (!reloadButtonRef.current) return false;
      const rect = reloadButtonRef.current.getBoundingClientRect();
      return (
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom
      );
    },
    []
  );

  const handleReload = useCallback(
    async (e: React.MouseEvent | React.PointerEvent) => {
      e.stopPropagation();
      e.preventDefault();

      if (isReloading) return;

      setIsReloading(true);

      try {
        const video = videoRef.current;
        if (!video) return;

        const tracks = stream.getVideoTracks();
        const track = tracks[0];
        if (!track) return;

        track.enabled = false;
        video.pause();

        await new Promise((resolve) => setTimeout(resolve, 100));

        const gl = glRef.current;
        if (gl) {
          if (texRef.current) {
            gl.deleteTexture(texRef.current);
            texRef.current = null;
          }
          allocTexRef.current = null;
        }

        track.enabled = true;
        await video.play();

        if (video.videoWidth && video.videoHeight) {
          setMeta({ vw: video.videoWidth, vh: video.videoHeight });
        }

        if (onReload) {
          onReload();
        }
      } catch (error) {
        console.error("[WebGLCanvasCamera] Reload failed:", error);
      } finally {
        setIsReloading(false);
      }
    },
    [stream, onReload, isReloading]
  );

  const compileShader = (
    gl: WebGL2RenderingContext,
    type: number,
    source: string
  ) => {
    const sh = gl.createShader(type);
    if (!sh) throw new Error("Failed to create shader");
    gl.shaderSource(sh, source);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      const log = gl.getShaderInfoLog(sh) || "(empty)";
      gl.deleteShader(sh);
      throw new Error(`Shader compile failed: ${log}`);
    }
    return sh;
  };

  const linkProgram = (
    gl: WebGL2RenderingContext,
    vs: WebGLShader,
    fs: WebGLShader
  ) => {
    const prog = gl.createProgram();
    if (!prog) throw new Error("Failed to create program");
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      const log = gl.getProgramInfoLog(prog) || "(empty)";
      gl.deleteProgram(prog);
      throw new Error(`Program link failed: ${log}`);
    }
    return prog;
  };

  const calcLayout = useCallback(
    (
      vw: number,
      vh: number,
      cw: number,
      ch: number,
      dpr: number,
      ovVal: number
    ): CameraLayout => {
      const ov = Math.max(1, ovVal);
      const rc = cw / ch;
      const rv = vw / vh;
      let sx = 0,
        sy = 0,
        sw = vw,
        sh = vh;

      if (rv > rc) {
        sw = vh * rc;
        sx = (vw - sw) * 0.5;
      } else {
        sh = vw / rc;
        sy = (vh - sh) * 0.5;
      }

      const osw = sw / ov;
      const osh = sh / ov;
      sx += (sw - osw) * 0.5;
      sy += (sh - osh) * 0.5;

      return { cw, ch, dpr, sx, sy, sw: osw, sh: osh };
    },
    []
  );

  const updateUV = useCallback(
    (gl: WebGL2RenderingContext, L: CameraLayout, vw: number, vh: number) => {
      if (!uUVRectRef.current) return;
      const invW = 1 / vw;
      const invH = 1 / vh;
      const u0 = L.sx * invW;
      const u1 = (L.sx + L.sw) * invW;
      const v0 = 1.0 - L.sy * invH;
      const v1 = 1.0 - (L.sy + L.sh) * invH;

      gl.uniform4f(uUVRectRef.current, u0, v0, u1, v1);
    },
    []
  );

  const initGL2 = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) throw new Error("Canvas not found");

    const gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "high-performance",
      preserveDrawingBuffer: false, // ★ パフォーマンス重視
    }) as WebGL2RenderingContext | null;

    if (!gl) throw new Error("WebGL2 not supported");
    if (gl.isContextLost()) throw new Error("Context lost at init");

    glRef.current = gl;
    contextLostRef.current = false;

    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    try {
      (gl as any).pixelStorei(
        (gl as any).UNPACK_COLORSPACE_CONVERSION_WEBGL,
        (gl as any).NONE
      );
    } catch {}

    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);
    gl.clearColor(0, 0, 0, 1);

    const vs = compileShader(gl, gl.VERTEX_SHADER, VS_300);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, FS_300);
    const prog = linkProgram(gl, vs, fs);
    progRef.current = prog;

    gl.useProgram(prog);
    const uTex = gl.getUniformLocation(prog, "u_texture");
    uUVRectRef.current = gl.getUniformLocation(prog, "u_uvRect");
    if (!uTex || !uUVRectRef.current)
      throw new Error("Uniform locations not found");
    gl.uniform1i(uTex, 0);

    const vao = gl.createVertexArray();
    if (!vao) throw new Error("Failed to create VAO");
    vaoRef.current = vao;
    gl.bindVertexArray(vao);
    gl.bindVertexArray(null);
  }, []);

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;

    const onLost = (e: Event) => {
      e.preventDefault();
      contextLostRef.current = true;
      const gl = glRef.current;
      if (gl) {
        if (texRef.current) gl.deleteTexture(texRef.current);
      }
      texRef.current = null;
      allocTexRef.current = null;
    };

    const onRestored = () => {
      contextLostRef.current = false;
      texRef.current = null;
      allocTexRef.current = null;
      initGL2();
    };

    cvs.addEventListener("webglcontextlost", onLost);
    cvs.addEventListener("webglcontextrestored", onRestored);
    return () => {
      cvs.removeEventListener("webglcontextlost", onLost);
      cvs.removeEventListener("webglcontextrestored", onRestored);
    };
  }, [initGL2]);

  useEffect(() => {
    initGL2();
    return () => {
      const gl = glRef.current;
      if (!gl) return;
      if (progRef.current) gl.deleteProgram(progRef.current);
      if (texRef.current) gl.deleteTexture(texRef.current);
      if (vaoRef.current) gl.deleteVertexArray(vaoRef.current);

      texRef.current = null;
      vaoRef.current = null;
      progRef.current = null;
      glRef.current = null;
    };
  }, [initGL2]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    v.srcObject = stream;
    v.muted = true;
    v.playsInline = true;
    v.autoplay = true;

    const onMeta = () => {
      if (v.videoWidth && v.videoHeight)
        setMeta({ vw: v.videoWidth, vh: v.videoHeight });
    };
    const onCanPlay = () => v.play().catch(() => {});
    const onEnded = () => (isRenderingRef.current = false);

    const tracks = stream.getVideoTracks();
    const track = tracks[0];

    if (track && typeof (track as any).getCapabilities === "function") {
      try {
        const caps: any = (track as any).getCapabilities();
        const sets: any = (track as any).getSettings?.() ?? {};
        if (caps && "zoom" in caps) {
          zoomStateRef.current.supported = true;
          zoomStateRef.current.min = caps.zoom?.min ?? 1;
          zoomStateRef.current.max =
            caps.zoom?.max ?? Math.max(1, sets.zoom ?? 1);
          zoomStateRef.current.step = caps.zoom?.step ?? 0.01;
          zoomStateRef.current.value = sets.zoom ?? 1;
        } else {
          zoomStateRef.current.supported = false;
        }
      } catch (e) {
        console.warn("[WebGLCanvasCamera] getCapabilities failed:", e);
        zoomStateRef.current.supported = false;
      }
    } else {
      zoomStateRef.current.supported = false;
    }

    tracks.forEach((t) => t.addEventListener("ended", onEnded));
    v.addEventListener("loadedmetadata", onMeta);
    v.addEventListener("loadeddata", onMeta);
    v.addEventListener("canplay", onCanPlay);

    if (
      v.readyState >= HTMLMediaElement.HAVE_METADATA &&
      v.videoWidth &&
      v.videoHeight
    ) {
      setMeta({ vw: v.videoWidth, vh: v.videoHeight });
      v.play().catch(() => {});
    }
    return () => {
      v.removeEventListener("loadedmetadata", onMeta);
      v.removeEventListener("loadeddata", onMeta);
      v.removeEventListener("canplay", onCanPlay);
      tracks.forEach((t) => t.removeEventListener("ended", onEnded));
    };
  }, [stream]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || !meta) return;
    const gl = glRef.current;
    if (!gl) return;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const cw = Math.max(1, entry.contentRect.width);
        const ch = Math.max(1, entry.contentRect.height);
        const dpr = Math.min(window.devicePixelRatio || 1, 2); // ★ DPR上限2

        const cached = cachedRef.current;
        if (cached.cw === cw && cached.ch === ch && cached.dpr === dpr)
          continue;

        cachedRef.current = { cw, ch, dpr };

        const W = Math.round(cw * dpr);
        const H = Math.round(ch * dpr);
        const cvs = canvasRef.current!;
        if (pixRef.current.w !== W || pixRef.current.h !== H) {
          cvs.width = W;
          cvs.height = H;
          cvs.style.width = `${cw}px`;
          cvs.style.height = `${ch}px`;
          gl.viewport(0, 0, W, H);
          pixRef.current = { w: W, h: H };
        }

        const L = calcLayout(meta.vw, meta.vh, cw, ch, dpr, overscan);
        layoutRef.current = L;

        gl.useProgram(progRef.current!);
        updateUV(gl, L, meta.vw, meta.vh);
      }
    });
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [meta, overscan, calcLayout, updateUV]);

  useEffect(() => {
    const gl = glRef.current;
    if (!gl || !meta) return;
    const { cw, ch, dpr } = cachedRef.current;
    if (cw > 0 && ch > 0) {
      const L = calcLayout(meta.vw, meta.vh, cw, ch, dpr, overscan);
      layoutRef.current = L;
      gl.useProgram(progRef.current!);
      updateUV(gl, L, meta.vw, meta.vh);
    }
  }, [meta, overscan, calcLayout, updateUV]);

  // ★ 同一フレーム内readPixels
  const makeSnapshotImageDataSameFrame = useCallback((): ImageData | null => {
    const canvas = canvasRef.current;
    const gl = glRef.current;
    if (!canvas || !gl) return null;
    if (gl.isContextLost()) return null;

    const w = canvas.width;
    const h = canvas.height;
    const byteLen = w * h * 4;
    const src = new Uint8Array(byteLen);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.flush(); // ★ finish() は使わない（Androidで重い）

    try {
      gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, src);
    } catch (e) {
      console.warn("[Snapshot] readPixels failed:", e);
      return null;
    }

    const row = w * 4;
    const dst = new Uint8ClampedArray(byteLen);
    for (let y = 0; y < h; y++) {
      const s = (h - 1 - y) * row;
      dst.set(src.subarray(s, s + row), y * row);
    }

    try {
      return new ImageData(dst, w, h, { colorSpace: "srgb" });
    } catch {
      return new ImageData(dst, w, h);
    }
  }, []);

  const render = useCallback(() => {
    if (!isRenderingRef.current || contextLostRef.current) return;

    const gl = glRef.current!;
    const v = videoRef.current!;
    const prog = progRef.current!;
    const vao = vaoRef.current!;
    if (!meta || !layoutRef.current) return;
    if (v.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
    if (gl.isContextLost()) {
      contextLostRef.current = true;
      return;
    }

    const sizeChanged =
      !allocTexRef.current ||
      allocTexRef.current.w !== v.videoWidth ||
      allocTexRef.current.h !== v.videoHeight;

    if (sizeChanged || !texRef.current) {
      if (texRef.current) gl.deleteTexture(texRef.current);
      const tex = gl.createTexture();
      if (!tex) return;
      texRef.current = tex;

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      try {
        gl.texStorage2D(
          gl.TEXTURE_2D,
          1,
          gl.RGBA8,
          v.videoWidth,
          v.videoHeight
        );
      } catch {
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA8,
          v.videoWidth,
          v.videoHeight,
          0,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          null
        );
      }
      allocTexRef.current = { w: v.videoWidth, h: v.videoHeight };
    } else {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texRef.current);
    }

    try {
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, v);
    } catch {
      if (texRef.current) gl.deleteTexture(texRef.current);
      texRef.current = null;
      allocTexRef.current = null;
      return;
    }

    gl.useProgram(prog);
    gl.bindVertexArray(vao);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindVertexArray(null);

    // ★ 同一フレーム内でスナップショット取得
    if (snapshotRequestedRef.current) {
      snapshotRequestedRef.current = false;

      const coords = snapshotCoordsRef.current;
      snapshotCoordsRef.current = null;

      const imageData = makeSnapshotImageDataSameFrame();
      if (imageData && onTap && coords) {
        const fire = () => onTap({ x: coords.cx, y: coords.cy, imageData });
        if (typeof (window as any).requestIdleCallback === "function") {
          (window as any).requestIdleCallback(fire, { timeout: 120 });
        } else {
          setTimeout(fire, 0);
        }
      }
    }
  }, [meta, makeSnapshotImageDataSameFrame, onTap]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    let stop = false;
    let raf = 0;
    isRenderingRef.current = true;

    const step = () => {
      if (stop) return;
      render();
      (v as any).requestVideoFrameCallback(step);
    };
    if ("requestVideoFrameCallback" in v) {
      (v as any).requestVideoFrameCallback(step);
    } else {
      const tick = () => {
        if (stop) return;
        render();
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }
    return () => {
      stop = true;
      isRenderingRef.current = false;
      if (raf) cancelAnimationFrame(raf);
    };
  }, [render]);

  const applyZoomScheduled = useCallback(() => {
    if (zoomApplyScheduledRef.current) return;
    zoomApplyScheduledRef.current = true;
    requestAnimationFrame(async () => {
      zoomApplyScheduledRef.current = false;
      const z = desiredZoomRef.current;
      if (z == null) return;

      const track = stream.getVideoTracks()[0];
      if (!track) return;

      try {
        await track.applyConstraints({
          advanced: [{ zoom: z } as MediaTrackConstraintSet],
        });
      } catch {
        try {
          await track.applyConstraints({ zoom: z } as MediaTrackConstraints);
        } catch (e2) {
          console.warn(
            "[WebGLCanvasCamera] applyConstraints(zoom) failed:",
            e2
          );
          zoomStateRef.current.supported = false;
          return;
        }
      }
      zoomStateRef.current.value = z;
    });
  }, [stream]);

  const clamp = (v: number, mn: number, mx: number) =>
    Math.min(mx, Math.max(mn, v));

  const screenToCanvas = (clientX: number, clientY: number) => {
    const root = wrapRef.current!;
    const cvs = canvasRef.current!;
    const rect = root.getBoundingClientRect();
    const dpr = layoutRef.current?.dpr || window.devicePixelRatio || 1;
    const W = cvs.width;
    const H = cvs.height;
    const cx = Math.max(
      0,
      Math.min(W - 1, Math.round((clientX - rect.left) * dpr))
    );
    const cy = Math.max(
      0,
      Math.min(H - 1, Math.round((clientY - rect.top) * dpr))
    );
    return { cx, cy };
  };

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const wheelHandler = (ev: WheelEvent) => {
      const zs = zoomStateRef.current;
      if (!zs.supported) return;
      if (isPointInReloadButton(ev.clientX, ev.clientY)) return;
      ev.preventDefault();
      const scale = Math.exp(-ev.deltaY * 0.002);
      const next = clamp(zs.value * scale, zs.min, zs.max);
      if (Math.abs(next - zs.value) < (zs.step || 0.001)) return;
      desiredZoomRef.current = next;
      applyZoomScheduled();
    };

    // ★ ピンチズーム対応の改善版
    const touches = new Map<
      number,
      { x: number; y: number; startX: number; startY: number }
    >();
    let initialDist = 0;
    let initialZoom = 1;
    let isPinching = false; // ★ ピンチ中フラグ

    const distance = (
      a: { x: number; y: number },
      b: { x: number; y: number }
    ) => Math.hypot(a.x - b.x, a.y - b.y);

    const pointerDown = (ev: PointerEvent) => {
      if (isPointInReloadButton(ev.clientX, ev.clientY)) return;

      if (ev.pointerType === "touch") {
        ev.preventDefault();
      }

      if (ev.isPrimary) {
        tapCandidateRef.current = {
          id: ev.pointerId,
          x: ev.clientX,
          y: ev.clientY,
          t: performance.now(),
        };
      }

      const zs = zoomStateRef.current;
      if (ev.pointerType !== "touch" || !zs.supported) return;

      touches.set(ev.pointerId, {
        x: ev.clientX,
        y: ev.clientY,
        startX: ev.clientX, // ★ 開始位置を記録
        startY: ev.clientY,
      });

      if (touches.size === 2) {
        const [a, b] = Array.from(touches.values());
        initialDist = distance(a!, b!);
        initialZoom = zs.value;
        isPinching = true; // ★ ピンチ開始
        tapCandidateRef.current = null; // タップキャンセル
      }
    };

    const pointerMove = (ev: PointerEvent) => {
      const zs = zoomStateRef.current;
      if (ev.pointerType !== "touch" || !zs.supported) return;
      if (!touches.has(ev.pointerId)) return;

      ev.preventDefault();

      const touch = touches.get(ev.pointerId)!;
      touches.set(ev.pointerId, {
        ...touch,
        x: ev.clientX,
        y: ev.clientY,
      });

      if (touches.size === 2 && initialDist > 0) {
        const [a, b] = Array.from(touches.values());
        const dist = distance(a!, b!);
        if (dist <= 0) return;
        const ratio = dist / initialDist;
        const next = clamp(initialZoom * ratio, zs.min, zs.max);
        if (Math.abs(next - zs.value) >= (zs.step || 0.001)) {
          desiredZoomRef.current = next;
          applyZoomScheduled();
        }
      }
    };

    const endPinchIfNeeded = () => {
      if (touches.size < 2) {
        isPinching = false;
        initialDist = 0;
      }
    };

    const cleanupPointer = (ev: PointerEvent, reason: string) => {
      if (ev.pointerType === "touch") {
        touches.delete(ev.pointerId);
        endPinchIfNeeded();
      }
      if (
        (reason === "up" || reason === "cancel") &&
        tapCandidateRef.current?.id === ev.pointerId
      ) {
        tapCandidateRef.current = null;
      }
    };

    const pointerUp = (ev: PointerEvent) => {
      if (isPointInReloadButton(ev.clientX, ev.clientY)) {
        cleanupPointer(ev, "up");
        return;
      }

      const cand = tapCandidateRef.current;

      // ★ ピンチ直後はタップとして扱わない
      const wasPinching = isPinching;
      cleanupPointer(ev, "up");

      if (!onTap || !layoutRef.current) return;
      if (wasPinching) return; // ★ ピンチ直後はスキップ

      if (cand && cand.id === ev.pointerId) {
        const dt = performance.now() - cand.t;
        const dx = Math.abs(ev.clientX - cand.x);
        const dy = Math.abs(ev.clientY - cand.y);
        const isTap = dx < TAP_MAX_DIST && dy < TAP_MAX_DIST && dt < TAP_MAX_MS;

        if (isTap) {
          const { cx, cy } = screenToCanvas(ev.clientX, ev.clientY);
          snapshotCoordsRef.current = { cx, cy };
          snapshotRequestedRef.current = true;
        }
      }
    };

    const pointerCancel = (ev: PointerEvent) => cleanupPointer(ev, "cancel");
    const pointerOut = (ev: PointerEvent) => {
      if (ev.pointerType === "touch") {
        touches.delete(ev.pointerId);
        endPinchIfNeeded();
      }
    };
    const pointerLeave = (ev: PointerEvent) => {
      if (ev.pointerType === "touch") {
        touches.delete(ev.pointerId);
        endPinchIfNeeded();
      }
    };

    const prevent = (e: Event) => e.preventDefault();

    el.addEventListener("wheel", wheelHandler, { passive: false });
    el.addEventListener("pointerdown", pointerDown, { passive: false });
    el.addEventListener("pointermove", pointerMove, { passive: false });
    el.addEventListener("pointerup", pointerUp, { passive: false });
    el.addEventListener("pointercancel", pointerCancel);
    el.addEventListener("pointerout", pointerOut);
    el.addEventListener("pointerleave", pointerLeave);
    el.addEventListener("contextmenu", (e) => e.preventDefault());
    el.addEventListener(
      "gesturestart",
      prevent as any,
      {
        passive: false,
      } as any
    );
    el.addEventListener(
      "gesturechange",
      prevent as any,
      {
        passive: false,
      } as any
    );
    el.addEventListener(
      "gestureend",
      prevent as any,
      {
        passive: false,
      } as any
    );

    return () => {
      el.removeEventListener("wheel", wheelHandler);
      el.removeEventListener("pointerdown", pointerDown);
      el.removeEventListener("pointermove", pointerMove);
      el.removeEventListener("pointerup", pointerUp);
      el.removeEventListener("pointercancel", pointerCancel);
      el.removeEventListener("pointerout", pointerOut);
      el.removeEventListener("pointerleave", pointerLeave);
      el.removeEventListener("contextmenu", prevent as any);
      el.removeEventListener("gesturestart", prevent as any);
      el.removeEventListener("gesturechange", prevent as any);
      el.removeEventListener("gestureend", prevent as any);
    };
  }, [applyZoomScheduled, onTap, isPointInReloadButton]);

  return (
    <div
      ref={wrapRef}
      className={className}
      onContextMenu={(e) => e.preventDefault()}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
        position: "relative",
        overflow: "hidden",
        background: "black",
        touchAction: "none",
        userSelect: "none",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          cursor: "crosshair",
        }}
      />
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          position: "absolute",
          left: -10000,
          top: -10000,
          width: 1,
          height: 1,
          opacity: 0,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "50px",
          left: "50%",
          width: "360px",
          transform: "translateX(-50%)",
          paddingTop: "8px",
          paddingBottom: "8px",
          background: "rgba(255, 255, 255, 0.6)",
          borderRadius: "16px",
          color: "#333",
          fontSize: "14px",
          textAlign: "center",
          zIndex: 5,
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
          pointerEvents: "none",
          userSelect: "none",
          backdropFilter: "blur(6px)",
        }}
      >
        対象の文字を画面中央に合わせてタップしてください
      </div>
      {reloadPos && (
        <button
          ref={reloadButtonRef}
          onClick={handleReload}
          onPointerDown={(e) => {
            e.stopPropagation();
          }}
          onPointerUp={(e) => {
            e.stopPropagation();
          }}
          disabled={isReloading}
          style={{
            ...getReloadButtonStyle(),
            opacity: isReloading ? 0.5 : 1,
            transform: isReloading ? "scale(0.95)" : "scale(1)",
          }}
          onMouseEnter={(e) => {
            if (!isReloading) {
              e.currentTarget.style.background = "rgba(0, 0, 0, 0.8)";
              e.currentTarget.style.transform = "scale(1.1)";
            }
          }}
          onMouseLeave={(e) => {
            if (!isReloading) {
              e.currentTarget.style.background = "rgba(0, 0, 0, 0.6)";
              e.currentTarget.style.transform = "scale(1)";
            }
          }}
          aria-label="カメラをリロード"
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: isReloading ? "spin 1s linear infinite" : "none",
            }}
          >
            {reloadIcon || <DefaultReloadIcon />}
          </div>
        </button>
      )}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}
