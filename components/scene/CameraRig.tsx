'use client';
import { useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { MathUtils, Vector3 } from 'three';
import { motion } from '../../lib/motion';
import { chapterCameras, mobileCameraOffset, sceneSpacing } from '../../lib/choreography';
import { animationDelta, chapterDolly } from '../../lib/scroll-state';
export default function CameraRig() {
  const {camera,size}=useThree();
  const target=useMemo(()=>new Vector3(),[]),position=useMemo(()=>new Vector3(),[]);
  useFrame((_,dt)=>{
    const p=motion.progress,i=Math.min(3,Math.floor(p)),t=MathUtils.smoothstep(p-i,0,1);
    const mobile=size.width<760,a=chapterCameras[i],b=chapterCameras[i+1];
    position.set(MathUtils.lerp(a[0],b[0],t),MathUtils.lerp(a[1],b[1],t),MathUtils.lerp(a[2],b[2],t)+(mobile?mobileCameraOffset:0));
    position.z-=chapterDolly(motion.local,motion.reduced);
    if(!motion.reduced){position.x+=motion.pointerX*.18;position.y+=motion.pointerY*.09;}
    target.set(MathUtils.lerp(i*sceneSpacing,(i+1)*sceneSpacing,t)+(mobile?0:-.3),mobile?2.1:1.8,0);
    // A demand loop's first delta includes idle time; don't jump over transitions.
    camera.position.lerp(position,motion.reduced?1:1-Math.exp(-animationDelta(dt)*7));camera.lookAt(target);
    camera.updateMatrixWorld();
  }, -50);
  return null;
}
