import { useRef, useState } from 'react'
import { ArrowUpRight, Upload, LockKeyhole, LoaderCircle } from 'lucide-react'
import { Button } from './ui/button'
export function Uploader({ onFile, busy, compact = false }: { onFile: (file: File) => void; busy: boolean; compact?: boolean }) {
  const input = useRef<HTMLInputElement>(null), [dragging, setDragging] = useState(false)
  return <div className={`uploader ${dragging ? 'dragging' : ''} ${compact ? 'compact' : ''}`} onDragOver={e => { e.preventDefault(); setDragging(true) }} onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false) }} onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) onFile(f) }}>
    <input ref={input} type="file" accept="image/png,image/jpeg,image/webp" aria-label="Choose screenshot" hidden onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = '' }}/>
    <span className="upload-icon">{busy ? <LoaderCircle className="spin"/> : <Upload size={24}/>}</span>
    <h3>{busy ? 'Opening your image…' : 'Drop your screenshot here'}</h3><p>or paste an image with <kbd>⌘</kbd> <kbd>V</kbd> / <kbd>Ctrl V</kbd></p>
    <Button onClick={() => input.current?.click()} disabled={busy}>Upload screenshot <ArrowUpRight size={17}/></Button>
    <small>PNG, JPG, or WebP · Up to 20 MB</small><div className="local-caption"><LockKeyhole size={12}/> Your image stays on your device</div>
  </div>
}
