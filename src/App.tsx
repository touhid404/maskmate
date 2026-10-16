import { Component, useCallback, useEffect, useRef, useState } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { Toaster, toast } from 'sonner'
import { Home } from './components/Home'
import { Uploader } from './components/Uploader'
function Editor({source,onHome,onFile,onDemo,busy}:{source:SourceImage|null;onHome:()=>void;onFile:(f:File)=>void;onDemo:()=>void;busy:boolean}) {
  const canvas=useRef<HTMLCanvasElement>(null)
  useEffect(()=>{if(source&&canvas.current){canvas.current.width=source.width;canvas.current.height=source.height;canvas.current.getContext('2d')?.drawImage(source.image,0,0)}},[source])
  return <main className="empty-editor"><div className="container"><Button variant="ghost" onClick={onHome}>Back to home</Button><h1>{source?'Your screenshot is ready.':'Let’s keep it private.'}</h1><p>{source?`${source.name} · ${source.width} × ${source.height} pixels`:'Choose a screenshot to preview locally.'}</p>{source?<canvas ref={canvas} style={{maxWidth:'100%',maxHeight:'65vh',margin:'30px auto',display:'block'}}/>:<><Uploader onFile={onFile} busy={busy}/><button className="text-button" onClick={onDemo}>Try a sample screenshot</button></>}</div></main>
}
import { Button } from './components/ui/button'
import { decodeFile } from './lib/upload'
import { createDemo } from './lib/demo'
import type { SourceImage } from './types/editor'
class ErrorBoundary extends Component<{children:ReactNode},{error:boolean}> {
  state={error:false}
  static getDerivedStateFromError(){return {error:true}}
  componentDidCatch(error:Error,info:ErrorInfo){console.error(error,info.componentStack)}
  render(){return this.state.error?<main className="error-page"><h1>Something didn’t render.</h1><p>Please reload MaskMate and choose your image again. Images aren’t saved between sessions.</p><Button onClick={()=>window.location.assign('/')}>Reload MaskMate</Button></main>:this.props.children}
}
function Application(){
  const [path,setPath]=useState(window.location.pathname),[source,setSource]=useState<SourceImage|null>(null),[busy,setBusy]=useState(false)
  const sourceRef=useRef<SourceImage|null>(null),request=useRef(0),mounted=useRef(true)
  const navigate=useCallback((url:string)=>{window.history.pushState({},'',url);setPath(url);window.scrollTo(0,0)},[])
  useEffect(()=>{const pop=()=>setPath(window.location.pathname);window.addEventListener('popstate',pop);return()=>window.removeEventListener('popstate',pop)},[])
  useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;sourceRef.current?.image.close()}},[])
  const replace=useCallback((next:SourceImage)=>{sourceRef.current?.image.close();sourceRef.current=next;setSource(next);navigate('/editor')},[navigate])
  const onFile=useCallback(async(file:File)=>{
    if(sourceRef.current&&!window.confirm('Replace the current image? Its edits will be discarded.'))return
    const id=++request.current;setBusy(true)
    try{const next=await decodeFile(file);if(!mounted.current||id!==request.current){next.image.close();return}replace(next);toast.success('Image opened. Choose a tool and cover an area.')}catch(e){if(mounted.current&&id===request.current)toast.error(e instanceof Error?e.message:'Could not open the image.')}finally{if(mounted.current&&id===request.current)setBusy(false)}
  },[replace])
  useEffect(()=>{const paste=(e:ClipboardEvent)=>{if(e.target instanceof HTMLElement&&(e.target.matches('input,textarea')||e.target.isContentEditable))return;const item=Array.from(e.clipboardData?.items??[]).find(i=>i.type.startsWith('image/'));const file=item?.getAsFile();if(file){e.preventDefault();void onFile(file)}};window.addEventListener('paste',paste);return()=>window.removeEventListener('paste',paste)},[onFile])
  async function onDemo(){const id=++request.current;setBusy(true);try{const demo=await createDemo();if(!mounted.current||id!==request.current){demo.image.close();return}replace(demo)}catch{toast.error('Could not open the sample. Please upload an image.')}finally{if(mounted.current&&id===request.current)setBusy(false)}}
  function onHome(){request.current++;sourceRef.current?.image.close();sourceRef.current=null;setSource(null);setBusy(false);navigate('/')}
  return <><a className="skip-link" href="#main-content">Skip to content</a><div id="main-content">{path==='/'?<Home onFile={onFile} busy={busy} onDemo={()=>void onDemo()} onEditor={()=>navigate('/editor')}/>:path==='/editor'?<Editor source={source} onHome={onHome} onFile={onFile} busy={busy} onDemo={()=>void onDemo()}/>:<main className="error-page"><span className="eyebrow">404 · A LITTLE LOST?</span><h1>Nothing to see here.</h1><p>Let’s get you back to protecting your screenshots.</p><Button onClick={()=>navigate('/')}>Back to MaskMate</Button></main>}</div><Toaster richColors position="bottom-center" closeButton/></>
}
export default function App(){return <ErrorBoundary><Application/></ErrorBoundary>}
