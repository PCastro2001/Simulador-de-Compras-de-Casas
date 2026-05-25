type ProgressStepsProps = {
  steps: string[];
  currentStep: number;
};

export function ProgressSteps({ steps, currentStep }: ProgressStepsProps) {
  return (
    <div className="space-y-3" aria-label="Progreso del recorrido">
      <div className="h-2 overflow-hidden rounded-full bg-slate-200 shadow-inner">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#6b9ac4] to-[#87c0a3] transition-all duration-300"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>
      <div className="flex items-center justify-between gap-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">
        {steps.map((step, index) => (
          <span key={step} className={index === currentStep ? "text-[#6b9ac4]" : ""}>
            {index + 1}. {step}
          </span>
        ))}
      </div>
    </div>
  );
}
