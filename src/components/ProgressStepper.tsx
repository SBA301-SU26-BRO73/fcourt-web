import { Check } from 'lucide-react';

interface Step {
  number: number;
  label: string;
}

const STEPS: Step[] = [
  { number: 1, label: 'Thông tin' },
  { number: 2, label: 'Thanh toán' },
  { number: 3, label: 'Xác nhận' },
];

interface ProgressStepperProps {
  currentStep?: number;
}

export function ProgressStepper({ currentStep = 2 }: ProgressStepperProps) {
  return (
    <div className="flex items-center justify-center gap-1 mb-2">
      {STEPS.map((step, index) => {
        const completed = step.number < currentStep;
        const active = step.number === currentStep;

        return (
          <div key={step.number} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  completed || active
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {completed ? (
                  <Check className="w-4 h-4" />
                ) : (
                <span className="text-xs font-semibold">{step.number}</span>
                )}
              </div>
              <span
                className={`text-[11px] mt-1 font-medium ${
                  active ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={`w-14 h-0.5 mx-1 mb-5 ${
                  completed ? 'bg-primary' : 'bg-border'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
