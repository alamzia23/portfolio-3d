'use client';
import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { BoxGeometry, EdgesGeometry, MeshBasicMaterial } from 'three';
type Resources = {box:BoxGeometry;edges:EdgesGeometry;surface:MeshBasicMaterial};
const Context=createContext<Resources|null>(null);
export function WireResources({children}:{children:ReactNode}) {
  const resources=useMemo(()=>{
    const box=new BoxGeometry();
    return {box,edges:new EdgesGeometry(box),surface:new MeshBasicMaterial({color:'#07090a'})};
  },[]);
  useEffect(()=>()=>{resources.box.dispose();resources.edges.dispose();resources.surface.dispose();},[resources]);
  return <Context.Provider value={resources}>{children}</Context.Provider>;
}
export function useWireResources(){
  const resources=useContext(Context);
  if(!resources)throw new Error('Wire geometry requires the scene resource provider.');
  return resources;
}
