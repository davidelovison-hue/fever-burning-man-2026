export type FzStepperStep = {
  id: string;
  label: string;
};

export function FzStepper({
  steps,
  currentIndex,
  onStepClick,
}: {
  steps: FzStepperStep[];
  currentIndex: number;
  onStepClick?: (index: number) => void;
}) {
  return (
    <div className="fz-stepper">
      <div className="fz-stepper__head">
        <div className="fz-stepper__track" role="tablist" aria-label="Request steps">
          {steps.map((step, index) => {
            const isActive = index === currentIndex;
            const isDone = index < currentIndex;
            const canClick = Boolean(onStepClick) && index <= currentIndex;

            return (
              <button
                key={step.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-current={isActive ? 'step' : undefined}
                className={[
                  'fz-stepper__step',
                  isActive ? 'fz-stepper__step--active' : '',
                  isDone ? 'fz-stepper__step--done' : '',
                ].filter(Boolean).join(' ')}
                onClick={() => canClick && onStepClick?.(index)}
                disabled={!canClick}
              >
                {isActive && <span className="fz-stepper__progress" aria-hidden />}
                <span className="fz-stepper__step-num">Step {index + 1}</span>
                <span className="fz-stepper__step-label">{step.label}</span>
              </button>
            );
          })}
        </div>
        <span className="fz-stepper__badge">
          Step {currentIndex + 1}/{steps.length}
        </span>
      </div>
    </div>
  );
}
