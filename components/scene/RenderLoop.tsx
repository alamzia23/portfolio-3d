'use client';
import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { motion, subscribeSceneFrames } from '../../lib/motion';
import { renderBudget } from '../../lib/render-budget';

export default function RenderLoop() {
  const { invalidate, gl, size, setDpr } = useThree();
  const activeUntil = useRef(0);
  useEffect(() => {
    const budget = renderBudget(size.width, size.height, window.devicePixelRatio || 1);
    setDpr(budget.dpr);
    // The opaque smoked glass is already roughened; preserve full-resolution geometry,
    // edges and lighting while sampling refraction from a smaller offscreen buffer.
    gl.transmissionResolutionScale = budget.transmissionScale;
    invalidate();
  }, [gl, size.width, size.height, setDpr, invalidate]);
  useEffect(() => {
    const wake = () => {
      if (document.hidden) return;
      // Exponential camera/environment/gallery damping finishes before sleeping.
      activeUntil.current = performance.now() + (motion.reduced ? 0 : 2400);
      invalidate();
    };
    const unsubscribe = subscribeSceneFrames(wake);
    document.addEventListener('visibilitychange', wake);
    wake();
    return () => { unsubscribe(); document.removeEventListener('visibilitychange', wake); };
  }, [invalidate]);
  useFrame(() => {
    if (!document.hidden && performance.now() < activeUntil.current) invalidate();
  }, -100);
  return null;
}
