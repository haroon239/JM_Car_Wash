export function Notice({message,onClose}:{message:string;onClose:()=>void}){return message?<div className="notice"><span>✓</span>{message}<button onClick={onClose}>×</button></div>:null}
