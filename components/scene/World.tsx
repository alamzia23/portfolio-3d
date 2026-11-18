'use client';

import { memo, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Edges, Environment, Lightformer, MeshReflectorMaterial, RoundedBox, Line } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from '../../lib/motion';
import CameraRig from './CameraRig';
import RenderLoop from './RenderLoop';
import { visibleStageDistance } from '../../lib/render-budget';
import { WireResources, useWireResources } from './WireResources';
import { animationDelta } from '../../lib/scroll-state';

const glass = { color: '#303b40', metalness: 0.32, roughness: 0.13, transmission: 0.68, thickness: 1.3, ior: 1.48, clearcoat: 1, envMapIntensity: 1.8 };
const darkGround=new THREE.Color('#020406'),lightGround=new THREE.Color('#434c51');
const darkFog=new THREE.Color('#020406'),lightFog=new THREE.Color('#899397');

function Monolith() {
  const shapes = useMemo(() => {
    const polygon = (points: number[][]) => { const s = new THREE.Shape(); points.forEach(([x,y],i) => i ? s.lineTo(x,y) : s.moveTo(x,y)); s.closePath(); return s; };
    const a = polygon([[-1.65,0],[-.55,4.2],[.15,4.2],[1.15,0],[.43,0],[-.2,3.05],[-.94,0]]);
    const z = polygon([[.35,3.7],[1.85,3.7],[1.85,3.1],[.73,.65],[1.9,.65],[1.9,0],[-.1,0],[-.1,.62],[1.1,3.08],[.35,3.08]]);
    return [a,z];
  }, []);
  return <group rotation={[0, -.24, 0]} position={[0,.12,0]}>
    {shapes.map((shape,i) => <mesh key={i} position={[0,0,i * -.2]} castShadow>
      <extrudeGeometry args={[shape,{ depth:.48, bevelEnabled:true, bevelSegments:3, steps:1, bevelSize:.055, bevelThickness:.055 }]} />
      <meshPhysicalMaterial {...glass} />
      <Edges threshold={32} color="#89989e" />
    </mesh>)}
    <mesh position={[-.22,1.65,.36]} rotation={[0,0,Math.PI/4]}>
      <octahedronGeometry args={[.42,0]} /><meshPhysicalMaterial color="#c3dbe4" transmission={.96} thickness={.7} roughness={.02} ior={1.8} metalness={.1} />
    </mesh>
  </group>;
}

function WireBox({ position = [0,0,0], scale = [1,1,1], color = '#a7b9c0' }: { position?: [number,number,number]; scale?: [number,number,number]; color?: string }) {
  const resources=useWireResources();
  return <group position={position} scale={scale}>
    <mesh geometry={resources.box} material={resources.surface} dispose={null}/>
    <lineSegments geometry={resources.edges} dispose={null}><lineBasicMaterial color={color}/></lineSegments>
  </group>;
}

function Assembly({ kind, wire = false }: { kind: number; wire?: boolean }) {
  const material = wire ? <meshBasicMaterial color="#0b0f11" /> : <meshPhysicalMaterial {...glass} transmission={.28} />;
  return <group>
    {Array.from({ length:kind === 3 ? 5 : 4 },(_,i) => <group key={i} position={kind === 3 ? [Math.cos(i*1.256)*1.1,Math.sin(i*1.256)*1.1,0] : [(i%2-.5)*1.12,Math.floor(i/2)*1.12-.55, Math.sin(i)*.2]}>
      <RoundedBox args={[.8,.8,.65]} radius={.055} smoothness={2}>{material}<Edges color={wire ? '#d3dcdf' : '#73929c'} /></RoundedBox>
      {!wire && <mesh position={[0,0,.34]}><planeGeometry args={[.42,.012]} /><meshBasicMaterial color="#b9d4d9" /></mesh>}
    </group>)}
    <Line points={[[-1.25,-1.2,0],[-1.25,1.3,0],[1.25,1.3,0],[1.25,-1.2,0],[-1.25,-1.2,0]]} color="#627c88" lineWidth={.7} />
    {kind === 2 && <mesh rotation={[Math.PI/2,0,0]}><torusGeometry args={[1.6,.025,8,64]} /><meshStandardMaterial color="#c3d8de" metalness={.8} roughness={.25} /></mesh>}
    {kind === 3 && <mesh><icosahedronGeometry args={[.43,0]} /><meshPhysicalMaterial {...glass} color="#bad0d6" /></mesh>}
  </group>;
}

function Gallery() {
  const groups = useRef<THREE.Group[]>([]);
  const destination=useMemo(()=>new THREE.Vector3(),[]);
  useFrame((_,delta) => groups.current.forEach((g,i) => {
    const dt=animationDelta(delta);
    const relative = ((i-motion.project+4+2)%4)-2;
    const angle = relative*.83;
    destination.set(Math.sin(angle)*5,2.25,-Math.abs(relative)*1.5);
    g.position.lerp(destination, motion.reduced ? 1 : 1-Math.exp(-dt*5));
    g.rotation.y = motion.reduced ? -angle*.6 : THREE.MathUtils.damp(g.rotation.y,-angle*.6,5,dt);
    g.scale.setScalar(motion.reduced ? (relative === 0 ? 1 : .68) : THREE.MathUtils.damp(g.scale.x, relative === 0 ? 1 : .68,5,dt));
  }), -20);
  return <group>{[0,1,2,3].map(i => <group key={i} ref={g=>{if(g)groups.current[i]=g;}}><Assembly kind={i} /></group>)}</group>;
}

function ProcessRig() {
  const group = useRef<THREE.Group>(null);
  useFrame((_,dt) => { if(group.current) group.current.rotation.y = motion.reduced ? -.35 : THREE.MathUtils.damp(group.current.rotation.y, -.35+motion.process*.17,3,animationDelta(dt)); }, -20);
  return <group ref={group} position={[0,1.9,0]}>
    <Assembly kind={2} wire />
    {[-2.7,2.7].map((x,i)=><group key={x} position={[x,0,-1]}>
      <WireBox scale={[1.25,2.6,1]} />
      {[0,1,2,3,4].map(n=><WireBox key={n} position={[0,n*.42-.85,.05]} scale={[1.05,.26,1.05]} color={n === i+1 ? '#d7e7e9' : '#6c818a'} />)}
      <Line points={[[0,1.5,0],[-x,2.2,0],[-x,1.5,1]]} color="#91a9b3" dashed dashSize={.1} gapSize={.07} />
    </group>)}
    <gridHelper args={[10,20,'#53666e','#27343b']} position={[0,-1.8,0]} />
  </group>;
}

function Studio() {
  return <group position={[1.2,0,-.5]} rotation={[0,-.25,0]}>
    <WireBox position={[0,1.3,0]} scale={[4.8,.13,2]} />
    {[-2,2].map(x=><WireBox key={x} position={[x,.65,0]} scale={[.1,1.3,1.6]} />)}
    <WireBox position={[0,2.3,-.4]} scale={[2.3,1.35,.14]} />
    <WireBox position={[0,1.65,-.4]} scale={[.12,.7,.1]} />
    <WireBox position={[0,1.42,.4]} scale={[1.4,.05,.45]} />
    <WireBox position={[3.2,1.8,-1]} scale={[1.2,3.6,1.6]} />
    {[0,1,2,3,4,5].map(n=><WireBox key={n} position={[3.2,.4+n*.55,-.1]} scale={[1,.38,.08]} />)}
    <Line points={[[-4,0,1],[-4,5,1],[4.5,5,1],[4.5,0,1]]} color="#364b54" />
    <gridHelper args={[14,14,'#40505b','#1d2c34']} />
  </group>;
}

function ContactSculpture() {
  const group = useRef<THREE.Group>(null);
  useFrame((_,dt)=>{if(group.current) group.current.rotation.y=motion.reduced ? .3 : THREE.MathUtils.damp(group.current.rotation.y,.3+motion.pointerX*.12,3,animationDelta(dt));}, -20);
  return <group ref={group} position={[0,2.1,0]} rotation={[.12,.3,.1]}>
    <RoundedBox args={[1.8,1.8,1.8]} radius={.12} smoothness={4}><meshPhysicalMaterial {...glass} color="#0c171c" /></RoundedBox>
    {[-1,1].flatMap(x=>[-1,1].map(y=><group key={`${x}${y}`}>
      <Line points={[[x*.8,y*.8,0],[x*2.5,y*1.25,0]]} color="#6d858f" lineWidth={1} />
      <mesh position={[x*2.5,y*1.25,0]} rotation={[.2,.3,.6]}><octahedronGeometry args={[.29]} /><meshPhysicalMaterial {...glass} color="#c3d6dd" /></mesh>
    </group>))}
  </group>;
}

const vertex = `varying vec3 vWorld; void main(){vec4 p=modelMatrix*vec4(position,1.);vWorld=p.xyz;gl_Position=projectionMatrix*viewMatrix*p;}`;
const fragment = `varying vec3 vWorld; uniform float uDark; uniform vec3 uCamera;
void main(){
  vec3 d=normalize(vWorld-uCamera);
  float horizon=exp(-abs(d.y+.015)*11.);
  vec3 c=mix(vec3(.014,.022,.027),vec3(.66,.72,.74),horizon);
  c=mix(c,vec3(.004,.007,.009),uDark);
  gl_FragColor=vec4(c,1.);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

function EnvironmentRig() {
  const sky = useRef<THREE.Mesh>(null);
  const ground = useRef<THREE.Mesh>(null);
  const fog = useRef<THREE.FogExp2>(null);
  const {size,gl}=useThree();
  const mobile=size.width<760;
  const supportsFloatTargets=gl.extensions.has('EXT_color_buffer_float');
  const uniforms = useMemo(()=>({uDark:{value:0},uCamera:{value:new THREE.Vector3()}}),[]);
  const normal = useMemo(()=>{
    const size=128, data=new Uint8Array(size*size*4);
    for(let y=0;y<size;y++) for(let x=0;x<size;x++){const p=(y*size+x)*4; data[p]=128+Math.sin(x*.9+y*.32)*9;data[p+1]=128+Math.cos(y*.38+Math.sin(x*.2))*17;data[p+2]=250;data[p+3]=255;}
    const t=new THREE.DataTexture(data,size,size,THREE.RGBAFormat);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(16,16);t.needsUpdate=true;return t;
  },[]);
  useEffect(()=>()=>normal.dispose(),[normal]);
  useFrame(({camera},delta)=>{
    const dt=animationDelta(delta);
    sky.current?.position.copy(camera.position); uniforms.uCamera.value.copy(camera.position);
    const dark=motion.chapter>=2&&motion.chapter<=3;
    uniforms.uDark.value=motion.reduced ? (dark?1:.28) : THREE.MathUtils.damp(uniforms.uDark.value,dark ? 1 : .28,4,dt);
    if(ground.current){const material=ground.current.material as THREE.MeshStandardMaterial;material.color.lerp(dark?darkGround:lightGround,motion.reduced?1:1-Math.exp(-dt*4));}
    fog.current?.color.lerp(dark?darkFog:lightFog,motion.reduced?1:1-Math.exp(-dt*4));
  }, -40);
  return <>
    <fogExp2 ref={fog} attach="fog" args={['#899397',mobile?.022:.035]}/>
    <mesh ref={sky}><sphereGeometry args={[90,24,16]} /><shaderMaterial side={THREE.BackSide} vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} depthWrite={false} /></mesh>
    <Environment resolution={128} frames={1}>
      <Lightformer intensity={5} position={[0,6,3]} scale={[8,3,1]} rotation={[Math.PI/2,0,0]} />
      <Lightformer intensity={4} position={[-5,2,1]} scale={[2,8,1]} rotation={[0,Math.PI/2,0]} />
      <Lightformer intensity={3} position={[5,3,-3]} scale={[3,8,1]} rotation={[0,-Math.PI/2,0]} color="#bdd6e2" />
    </Environment>
    <ambientLight intensity={.3} />
    <directionalLight position={[5,8,5]} intensity={2} color="#e4edf0" />
    <mesh ref={ground} rotation={[-Math.PI/2,0,0]} position={[36,-.02,0]}>
      <planeGeometry args={[170,100]} />
      {supportsFloatTargets?<MeshReflectorMaterial resolution={mobile?256:512} mirror={.75} mixStrength={2} mixBlur={1} blur={mobile?[100,40]:[250,80]} color="#434c51" metalness={.65} roughness={.35} normalMap={normal} normalScale={new THREE.Vector2(.09,.12)} depthScale={.3} minDepthThreshold={.4} maxDepthThreshold={1.4} />:<meshStandardMaterial color="#434c51" metalness={.8} roughness={.3} normalMap={normal} />}
    </mesh>
  </>;
}

function SceneChapter({x,children}:{x:number;children:ReactNode}) {
  const ref=useRef<THREE.Group>(null);
  useFrame(({camera})=>{
    if(!ref.current)return;
    const perspective=camera as THREE.PerspectiveCamera;
    ref.current.visible=Math.abs(camera.position.x-x)<visibleStageDistance(camera.position.z,perspective.aspect,perspective.fov);
  }, -10);
  return <group ref={ref} position={[x,0,0]}>{children}</group>;
}

function Stage({ onReady }: {onReady:()=>void}) {
  const {gl,scene}=useThree();
  // One matrix update after camera/chapter animation, before the reflection pass.
  useFrame(()=>scene.updateMatrixWorld(),-5);
  useEffect(()=>{const frame=requestAnimationFrame(onReady); const loss=(e:Event)=>{e.preventDefault();window.dispatchEvent(new Event('portfolio-context-lost'));};gl.domElement.addEventListener('webglcontextlost',loss);return()=>{cancelAnimationFrame(frame);gl.domElement.removeEventListener('webglcontextlost',loss);};},[gl,onReady]);
  return <WireResources><RenderLoop/><CameraRig /><EnvironmentRig /><SceneChapter x={0}><Monolith /></SceneChapter><SceneChapter x={18}><Gallery /></SceneChapter><SceneChapter x={36}><ProcessRig /></SceneChapter><SceneChapter x={54}><Studio /></SceneChapter><SceneChapter x={72}><ContactSculpture /></SceneChapter></WireResources>;
}

export default memo(function World({onReady}:{onReady:()=>void}) {
  return <Canvas frameloop="demand" camera={{position:[0,2.7,10.8],fov:43,near:.1,far:120}} dpr={1} gl={{antialias:true,alpha:false,powerPreference:'high-performance'}}><Stage onReady={onReady} /></Canvas>;
});
