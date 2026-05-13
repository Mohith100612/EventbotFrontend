export default function Spinner({ label }) {
  return (
    <div className="flex items-center gap-3 text-slate-500 text-sm">
      <span className="inline-block w-4 h-4 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
      {label && <span>{label}</span>}
    </div>
  );
}
