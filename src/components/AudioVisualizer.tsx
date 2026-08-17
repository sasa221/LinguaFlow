import React, { useEffect, useRef, useState } from 'react';
import { Activity, BarChart2, Radio, Sparkles, Volume2, Mic, Sliders } from 'lucide-react';

export type VisualizerMode = 'waveform' | 'bars' | 'radial';

interface AudioVisualizerProps {
  analyser?: AnalyserNode | null;
  userAnalyser?: AnalyserNode | null;
  aiAnalyser?: AnalyserNode | null;
  isActive?: boolean;
  isAiSpeaking?: boolean;
  isMicActive?: boolean;
  isConnected?: boolean;
  color?: string;
  userVolume?: number;
  partnerName?: string;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  analyser,
  userAnalyser,
  aiAnalyser,
  isActive = false,
  isAiSpeaking = false,
  isMicActive = false,
  isConnected = false,
  color = '#06b6d4',
  userVolume = 0,
  partnerName = 'AI Partner',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mode, setMode] = useState<VisualizerMode>('waveform');
  const [sensitivity, setSensitivity] = useState<number>(1.2);
  const animationFrameRef = useRef<number | null>(null);
  const idlePhaseRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const activeAnalyser = analyser || (isAiSpeaking ? aiAnalyser : userAnalyser) || userAnalyser || aiAnalyser;
    const timeData = new Uint8Array(128);
    const freqData = new Uint8Array(128);

    const render = () => {
      idlePhaseRef.current += 0.04;
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      let hasActiveAudio = false;
      if (activeAnalyser) {
        activeAnalyser.getByteTimeDomainData(timeData);
        activeAnalyser.getByteFrequencyData(freqData);

        let sum = 0;
        for (let i = 0; i < freqData.length; i++) {
          sum += freqData[i];
        }
        if (sum / freqData.length > 4 || userVolume > 0.05 || isAiSpeaking) {
          hasActiveAudio = true;
        }
      }

      if (mode === 'waveform') {
        drawFluidWaveform(
          ctx,
          width,
          height,
          hasActiveAudio ? timeData : null,
          isAiSpeaking,
          isMicActive || userVolume > 0.05,
          idlePhaseRef.current,
          sensitivity,
          color
        );
      } else if (mode === 'bars') {
        drawFrequencySpectrumBars(
          ctx,
          width,
          height,
          hasActiveAudio ? freqData : null,
          isAiSpeaking,
          isMicActive || userVolume > 0.05,
          idlePhaseRef.current,
          sensitivity
        );
      } else if (mode === 'radial') {
        drawRadialAura(
          ctx,
          width,
          height,
          hasActiveAudio ? freqData : null,
          isAiSpeaking,
          isMicActive || userVolume > 0.05,
          idlePhaseRef.current,
          sensitivity
        );
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [analyser, userAnalyser, aiAnalyser, isAiSpeaking, isMicActive, isConnected, isActive, color, mode, sensitivity, userVolume]);

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="w-full h-full relative overflow-hidden flex items-center justify-center">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};

function drawFluidWaveform(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  timeData: Uint8Array | null,
  isAi: boolean,
  isUser: boolean,
  phase: number,
  sensitivity: number,
  accentColor: string
) {
  const centerY = height / 2;
  const isSpeaking = (isAi || isUser) && timeData !== null;

  const waveLayers = [
    {
      color: isAi
        ? 'rgba(6, 182, 212, 0.9)'
        : isUser
        ? 'rgba(59, 130, 246, 0.9)'
        : accentColor || 'rgba(56, 189, 248, 0.5)',
      width: 2.5,
      frequency: 2.5,
      speed: 1.0,
      phaseOffset: 0,
      ampMultiplier: 1.0,
    },
    {
      color: isAi
        ? 'rgba(16, 185, 129, 0.65)'
        : isUser
        ? 'rgba(99, 102, 241, 0.65)'
        : 'rgba(129, 140, 248, 0.3)',
      width: 2.0,
      frequency: 3.2,
      speed: -1.2,
      phaseOffset: Math.PI / 3,
      ampMultiplier: 0.75,
    },
  ];

  waveLayers.forEach((layer) => {
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = layer.color;
    ctx.lineWidth = layer.width;
    ctx.shadowBlur = isSpeaking ? 12 : 4;
    ctx.shadowColor = layer.color;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const points: { x: number; y: number }[] = [];
    const segments = 48;
    const step = width / segments;

    for (let i = 0; i <= segments; i++) {
      const x = i * step;
      const progress = i / segments;
      const envelope = Math.sin(progress * Math.PI);

      let amplitude = 0;
      if (isSpeaking && timeData) {
        const dataIdx = Math.floor(progress * (timeData.length - 1));
        const byteVal = (timeData[dataIdx] - 128) / 128;
        amplitude = byteVal * (height * 0.4) * sensitivity * layer.ampMultiplier * envelope;
      } else {
        const idleAmp = (height * 0.1) * envelope;
        amplitude = Math.sin(progress * Math.PI * layer.frequency + phase * layer.speed + layer.phaseOffset) * idleAmp;
      }

      const y = centerY + amplitude;
      points.push({ x, y });
    }

    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 0; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }
    ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    ctx.stroke();
    ctx.restore();
  });
}

function drawFrequencySpectrumBars(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  freqData: Uint8Array | null,
  isAi: boolean,
  isUser: boolean,
  phase: number,
  sensitivity: number
) {
  const barCount = 32;
  const gap = 2;
  const barWidth = Math.max(2, (width - (barCount - 1) * gap) / barCount);
  const isSpeaking = (isAi || isUser) && freqData !== null;

  for (let i = 0; i < barCount; i++) {
    const x = i * (barWidth + gap);
    let barHeight = 4;

    if (isSpeaking && freqData) {
      const binIdx = Math.floor(Math.pow(i / barCount, 1.3) * (freqData.length - 1));
      const val = freqData[binIdx] / 255;
      barHeight = Math.max(4, val * (height * 0.85) * sensitivity);
    } else {
      const idleVal = (Math.sin(phase * 2 + i * 0.3) + 1) / 2;
      barHeight = 4 + idleVal * (height * 0.15);
    }

    const y = height / 2 - barHeight / 2;

    const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
    if (isAi) {
      grad.addColorStop(0, '#06b6d4');
      grad.addColorStop(1, '#3b82f6');
    } else if (isUser) {
      grad.addColorStop(0, '#38bdf8');
      grad.addColorStop(1, '#a855f7');
    } else {
      grad.addColorStop(0, 'rgba(56, 189, 248, 0.4)');
      grad.addColorStop(1, 'rgba(99, 102, 241, 0.2)');
    }

    ctx.save();
    ctx.fillStyle = grad;
    ctx.shadowBlur = isSpeaking ? 8 : 2;
    ctx.shadowColor = isAi ? '#06b6d4' : '#38bdf8';
    ctx.beginPath();
    ctx.roundRect(x, y, barWidth, barHeight, 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawRadialAura(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  freqData: Uint8Array | null,
  isAi: boolean,
  isUser: boolean,
  phase: number,
  sensitivity: number
) {
  const centerX = width / 2;
  const centerY = height / 2;
  const baseRadius = Math.min(centerX, centerY) * 0.4;
  const numRays = 32;
  const isSpeaking = (isAi || isUser) && freqData !== null;

  ctx.save();
  ctx.beginPath();
  ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2);
  ctx.strokeStyle = isAi
    ? 'rgba(6, 182, 212, 0.8)'
    : isUser
    ? 'rgba(59, 130, 246, 0.8)'
    : 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 2;
  ctx.shadowBlur = isSpeaking ? 16 : 4;
  ctx.shadowColor = isAi ? '#06b6d4' : '#3b82f6';
  ctx.stroke();
  ctx.restore();

  for (let i = 0; i < numRays; i++) {
    const angle = (i / numRays) * Math.PI * 2 + phase * 0.2;
    let rayLength = 4;

    if (isSpeaking && freqData) {
      const bin = Math.floor((i / numRays) * (freqData.length - 1));
      const val = freqData[bin] / 255;
      rayLength = 4 + val * (baseRadius * 0.8) * sensitivity;
    } else {
      const idleWave = (Math.sin(phase * 3 + i * 0.5) + 1) / 2;
      rayLength = 4 + idleWave * 8;
    }

    const x1 = centerX + Math.cos(angle) * baseRadius;
    const y1 = centerY + Math.sin(angle) * baseRadius;
    const x2 = centerX + Math.cos(angle) * (baseRadius + rayLength);
    const y2 = centerY + Math.sin(angle) * (baseRadius + rayLength);

    ctx.save();
    ctx.strokeStyle = isAi
      ? `hsl(${180 + i * 2}, 90%, 65%)`
      : isUser
      ? `hsl(${220 + i * 2}, 90%, 65%)`
      : 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  }
}
