type ProgressStepsProps = {
  steps: string[];
  currentStep: number;
};

export function ProgressSteps({ steps, currentStep }: ProgressStepsProps) {
  return (
    <div className="space-y-3" aria-label="Progreso del recorrido">
      <div className="h-1.5 overflow-hidden rounded-full bg-stone-200">
        <div
          className="h-full rounded-full bg-emerald-600 transition-all duration-300"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>
      <div className="flex items-center justify-between gap-2 text-[11px] font-semibold text-stone-500">
        {steps.map((step, index) => (
          <span key={step} className={index === currentStep ? "text-stone-950" : ""}>
            {index + 1}. {step}
          </span>
        ))}
      </div>
    </div>
  );
}
