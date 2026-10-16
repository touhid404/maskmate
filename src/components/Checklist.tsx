import { useState } from 'react'
import { ListChecks, ChevronDown, Check } from 'lucide-react'
const lists: Record<string,string[]> = {
  'General screenshot':['Names and profile pictures','Email addresses and phone numbers','Addresses and locations','Account details and QR codes'],
  'Payment or receipt':['Phone and account numbers','Transaction reference','Personal names and balances','QR codes and barcodes'],
  'Private chat':['Names and profile pictures','Private messages and attachments','Phone numbers and usernames','Locations and timestamps'],
  'Academic portal':['Student name and ID','Grades and private records','Email and contact details','Login and account information'],
  'Job application':['Name and contact details','Home address and location','References and private messages','Application and identification numbers']
}
export function Checklist() {
  const [category,setCategory]=useState('General screenshot'),[checked,setChecked]=useState<string[]>([]),[open,setOpen]=useState(true)
  return <section className="checklist"><button className="panel-heading" onClick={()=>setOpen(!open)} aria-expanded={open}><span><ListChecks size={17}/> Privacy check</span><ChevronDown size={15} style={{transform:open?'rotate(180deg)':undefined}}/></button>{open&&<><p>A second look, before you share.</p><label className="sr-only" htmlFor="category">Screenshot category</label><select id="category" value={category} onChange={e=>{setCategory(e.target.value);setChecked([])}}>{Object.keys(lists).map(c=><option key={c}>{c}</option>)}</select><div className="checklist-progress"><span style={{width:`${checked.length/lists[category].length*100}%`}}/></div><small>{checked.length} of {lists[category].length} reviewed · optional</small><div className="check-items">{lists[category].map(item=><label key={item}><input type="checkbox" checked={checked.includes(item)} onChange={e=>setChecked(e.target.checked?[...checked,item]:checked.filter(c=>c!==item))}/><span className="custom-check">{checked.includes(item)&&<Check size={12}/>}</span>{item}</label>)}</div><p className="check-disclaimer">A manual reminder, not image detection or a guarantee of privacy.</p></>}</section>
}
