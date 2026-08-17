import React, { useEffect, useRef } from 'react';
import { LiveSessionState } from '../types';

interface ConversationOrbProps {
  sessionState: LiveSessionState;
  userAnalyser?: AnalyserNode | null;
  aiAnalyser?: AnalyserNode | null;
  isMicMuted?: boolean;
  isInterrupted?: boolean;
  userVolume?: number;
  size?: number;
  className?: string;
  onClick?: () => void;
}

export const ConversationOrb: React.FC<ConversationOrbProps> = ({
  sessionState,
  userAnalyser,
  aiAnalyser,
  isMicMuted = false,
  isInterrupted = false,
  userVolume = 0,
  size = 220,
  className = '',
  onClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const phaseRef = useRef<number>(0);
  const smoothedEnergyRef = useRef<number>(0);
  const rippleRadiusRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const timeData = new Uint8Array(128);
    const freqData = new Uint8Array(128);

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const render = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;
      const centerX = width / 2;
      const centerY = height / 2;
      const baseRadius = Math.min(centerX, centerY) * 0.46;

      ctx.clearRect(0, 0, width, height);

      // Phase progression
      const phaseSpeed = prefersReducedMotion
        ? 0.005
        : sessionState === 'ai_speaking'
        ? 0.04
        : sessionState === 'user_speaking'
        ? 0.035
        : sessionState === 'thinking'
        ? 0.05
        : sessionState === 'connecting'
        ? 0.06
        : 0.015;

      phaseRef.current += phaseSpeed;
      const phase = phaseRef.current;

      // Calculate instantaneous audio energy from the appropriate AnalyserNode
      let targetEnergy = 0;
      if (sessionState === 'ai_speaking' && aiAnalyser) {
        aiAnalyser.getByteFrequencyData(freqData);
        let sum = 0;
        for (let i = 0; i < 32; i++) sum += freqData[i];
        targetEnergy = Math.min(1.2, (sum / 32 / 255) * 1.5);
      } else if (sessionState === 'user_speaking' && userAnalyser && !isMicMuted) {
        userAnalyser.getByteFrequencyData(freqData);
        let sum = 0;
        for (let i = 0; i < 32; i++) sum += freqData[i];
        targetEnergy = Math.max(userVolume * 1.6, (sum / 32 / 255) * 1.8);
      } else if (sessionState === 'listening' || sessionState === 'ready') {
        if (userAnalyser && !isMicMuted) {
          userAnalyser.getByteFrequencyData(freqData);
          let sum = 0;
          for (let i = 0; i < 16; i++) sum += freqData[i];
          targetEnergy = Math.min(0.35, (sum / 16 / 255) * 0.8);
        }
      }

      // Smooth energy with attack/release
      const smoothingFactor = targetEnergy > smoothedEnergyRef.current ? 0.3 : 0.08;
      smoothedEnergyRef.current += (targetEnergy - smoothedEnergyRef.current) * smoothingFactor;
      const energy = smoothedEnergyRef.current;

      // Handle Barge-in Interruption Ripple
      if (isInterrupted) {
        rippleRadiusRef.current += 3.5;
        if (rippleRadiusRef.current > baseRadius * 2.2) {
          rippleRadiusRef.current = 0;
        }
      } else {
        rippleRadiusRef.current = 0;
      }

      // Render layers based on state
      drawAuraLayers(ctx, centerX, centerY, baseRadius, sessionState, energy, phase, prefersReducedMotion);
      drawDeformedCore(ctx, centerX, centerY, baseRadius, sessionState, energy, phase, prefersReducedMotion);

      if (rippleRadiusRef.current > 0) {
        drawInterruptionRipple(ctx, centerX, centerY, rippleRadiusRef.current, baseRadius);
      }

      if (sessionState === 'connecting' || sessionState === 'thinking') {
        drawOrbitingNodes(ctx, centerX, centerY, baseRadius, phase, sessionState);
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [sessionState, userAnalyser, aiAnalyser, isMicMuted, isInterrupted, userVolume]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
  }, [size]);

  return (
    <div
      className={`relative flex items-center justify-center cursor-pointer select-none ${className}`}
      onClick={onClick}
      style={{ width: size, height: size }}
      role="status"
      aria-label={`Live Conversation status: ${sessionState}`}
    >
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size }}
        className="block pointer-events-none"
      />
    </div>
  );
};

// 1. Ambient Glow Aura
function drawAuraLayers(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  baseR: number,
  state: LiveSessionState,
  energy: number,
  phase: number,
  reducedMotion: boolean
) {
  ctx.save();

  let outerGlow = baseR * (1.25 + energy * 0.45);
  let colorCore = 'rgba(6, 182, 212, 0.4)';
  let colorOuter = 'rgba(6, 182, 212, 0)';

  switch (state) {
    case 'idle':
      outerGlow = baseR * (1.15 + Math.sin(phase) * 0.05);
      colorCore = 'rgba(56, 189, 248, 0.22)';
      break;
    case 'connecting':
      outerGlow = baseR * (1.3 + Math.sin(phase * 2) * 0.1);
      colorCore = 'rgba(14, 165, 233, 0.35)';
      break;
    case 'ready':
    case 'listening':
      outerGlow = baseR * (1.28 + energy * 0.35 + Math.sin(phase) * 0.04);
      colorCore = 'rgba(16, 185, 129, 0.32)';
      break;
    case 'user_speaking':
      outerGlow = baseR * (1.35 + energy * 0.7);
      colorCore = 'rgba(59, 130, 246, 0.45)';
      break;
    case 'thinking':
      outerGlow = baseR * (1.22 + Math.sin(phase * 3) * 0.08);
      colorCore = 'rgba(168, 85, 247, 0.38)';
      break;
    case 'ai_speaking':
      outerGlow = baseR * (1.4 + energy * 0.85);
      colorCore = 'rgba(6, 182, 212, 0.55)';
      break;
    case 'interrupted':
      outerGlow = baseR * 1.35;
      colorCore = 'rgba(192, 132, 252, 0.45)';
      break;
    case 'reconnecting':
      outerGlow = baseR * (1.2 + Math.sin(phase * 2) * 0.08);
      colorCore = 'rgba(245, 158, 11, 0.35)';
      break;
    case 'error':
      outerGlow = baseR * 1.2;
      colorCore = 'rgba(244, 63, 94, 0.35)';
      break;
  }

  const grad = ctx.createRadialGradient(cx, cy, baseR * 0.2, cx, cy, outerGlow);
  grad.addColorStop(0, colorCore);
  grad.addColorStop(0.65, colorCore.replace(/[\d.]+\)$/, '0.12)'));
  grad.addColorStop(1, colorOuter);

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, outerGlow, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// 2. Harmonic Fluid Core
function drawDeformedCore(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  baseR: number,
  state: LiveSessionState,
  energy: number,
  phase: number,
  reducedMotion: boolean
) {
  ctx.save();
  const numPoints = reducedMotion ? 24 : 48;
  const points: { x: number; y: number }[] = [];

  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * Math.PI * 2;
    let radius = baseR;

    if (state === 'idle') {
      const breathing = Math.sin(phase * 1.2) * (baseR * 0.04);
      radius = baseR + breathing;
    } else if (state === 'ready' || state === 'listening') {
      const ripple = Math.sin(angle * 4 + phase * 1.5) * (baseR * 0.03 + energy * baseR * 0.15);
      radius = baseR * 1.02 + ripple;
    } else if (state === 'user_speaking') {
      const deform1 = Math.sin(angle * 3 + phase * 3) * (energy * baseR * 0.28);
      const deform2 = Math.cos(angle * 5 - phase * 2) * (energy * baseR * 0.16);
      radius = baseR * (1 + energy * 0.18) + deform1 + deform2;
    } else if (state === 'ai_speaking') {
      const wave1 = Math.sin(angle * 4 + phase * 4) * (energy * baseR * 0.32);
      const wave2 = Math.cos(angle * 2 - phase * 3) * (energy * baseR * 0.2);
      radius = baseR * (1 + energy * 0.22) + wave1 + wave2;
    } else if (state === 'thinking') {
      const pulse = Math.sin(angle * 6 + phase * 4) * (baseR * 0.06);
      radius = baseR * 0.95 + pulse;
    } else if (state === 'connecting') {
      const spin = Math.sin(angle * 3 + phase * 4) * (baseR * 0.05);
      radius = baseR * 0.98 + spin;
    } else if (state === 'interrupted') {
      radius = baseR * 0.92;
    }

    points.push({
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
    });
  }

  // Draw smooth spline
  ctx.beginPath();
  ctx.moveTo((points[0].x + points[numPoints - 1].x) / 2, (points[0].y + points[numPoints - 1].y) / 2);
  for (let i = 0; i < numPoints; i++) {
    const nextIdx = (i + 1) % numPoints;
    const xc = (points[i].x + points[nextIdx].x) / 2;
    const yc = (points[i].y + points[nextIdx].y) / 2;
    ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
  }
  ctx.closePath();

  // Core Gradient
  const coreGrad = ctx.createRadialGradient(cx - baseR * 0.2, cy - baseR * 0.2, 0, cx, cy, baseR * 1.2);

  if (state === 'ai_speaking') {
    coreGrad.addColorStop(0, '#67e8f9'); // cyan-300
    coreGrad.addColorStop(0.45, '#06b6d4'); // cyan-500
    coreGrad.addColorStop(0.85, '#0e7490'); // cyan-700
    coreGrad.addColorStop(1, '#083344'); // cyan-950
  } else if (state === 'user_speaking') {
    coreGrad.addColorStop(0, '#93c5fd'); // blue-300
    coreGrad.addColorStop(0.45, '#3b82f6'); // blue-500
    coreGrad.addColorStop(0.85, '#1d4ed8'); // blue-700
    coreGrad.addColorStop(1, '#172554'); // blue-950
  } else if (state === 'ready' || state === 'listening') {
    coreGrad.addColorStop(0, '#6ee7b7'); // emerald-300
    coreGrad.addColorStop(0.45, '#10b981'); // emerald-500
    coreGrad.addColorStop(0.85, '#047857'); // emerald-700
    coreGrad.addColorStop(1, '#064e3b'); // emerald-950
  } else if (state === 'thinking') {
    coreGrad.addColorStop(0, '#c084fc'); // purple-400
    coreGrad.addColorStop(0.45, '#9333ea'); // purple-600
    coreGrad.addColorStop(0.85, '#6b21a8'); // purple-800
    coreGrad.addColorStop(1, '#3b0764'); // purple-950
  } else if (state === 'reconnecting') {
    coreGrad.addColorStop(0, '#fde047');
    coreGrad.addColorStop(0.5, '#f59e0b');
    coreGrad.addColorStop(1, '#78350f');
  } else if (state === 'error') {
    coreGrad.addColorStop(0, '#fda4af');
    coreGrad.addColorStop(0.5, '#f43f5e');
    coreGrad.addColorStop(1, '#881337');
  } else {
    // idle & connecting
    coreGrad.addColorStop(0, '#38bdf8'); // sky-400
    coreGrad.addColorStop(0.45, '#0284c7'); // sky-600
    coreGrad.addColorStop(0.85, '#0369a1'); // sky-700
    coreGrad.addColorStop(1, '#082f49'); // sky-950
  }

  ctx.fillStyle = coreGrad;
  ctx.shadowColor = state === 'ai_speaking' ? '#06b6d4' : state === 'user_speaking' ? '#3b82f6' : '#10b981';
  ctx.shadowBlur = energy > 0.1 ? 24 : 12;
  ctx.fill();

  // Internal specular shimmer
  const shimmerGrad = ctx.createLinearGradient(cx - baseR, cy - baseR, cx + baseR, cy + baseR);
  shimmerGrad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
  shimmerGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.05)');
  shimmerGrad.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
  ctx.fillStyle = shimmerGrad;
  ctx.fill();

  ctx.restore();
}

// 3. Orbiting Nodes for Connecting & Thinking states
function drawOrbitingNodes(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  baseR: number,
  phase: number,
  state: LiveSessionState
) {
  ctx.save();
  const numNodes = 3;
  const orbitR = baseR * 1.25;

  for (let i = 0; i < numNodes; i++) {
    const angle = phase * (state === 'thinking' ? 2 : 2.5) + (i * Math.PI * 2) / numNodes;
    const nx = cx + Math.cos(angle) * orbitR;
    const ny = cy + Math.sin(angle) * orbitR;

    ctx.beginPath();
    ctx.arc(nx, ny, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = state === 'thinking' ? '#c084fc' : '#38bdf8';
    ctx.shadowColor = state === 'thinking' ? '#9333ea' : '#0ea5e9';
    ctx.shadowBlur = 8;
    ctx.fill();
  }
  ctx.restore();
}

// 4. Interruption Barge-in Ripple
function drawInterruptionRipple(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  baseR: number
) {
  ctx.save();
  const alpha = Math.max(0, 1 - radius / (baseR * 2.2));
  ctx.strokeStyle = `rgba(192, 132, 252, ${alpha * 0.8})`;
  ctx.lineWidth = 2.5;
  ctx.shadowColor = '#c084fc';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}
