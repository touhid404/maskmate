import { ShieldCheck } from "lucide-react";
export function Brand({ onClick }: { onClick: () => void }) {
  return (
    <button className="brand" onClick={onClick} aria-label="MaskMate home">
      <span className="brand-mark">
        <ShieldCheck size={23} strokeWidth={1.8} />
      </span>
      maskmate<span className="brand-dot">.</span>
    </button>
  );
}
