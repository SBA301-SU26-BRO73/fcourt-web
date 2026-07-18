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
    <div className="flex items-center justify-center gap-2 mb-12">
      {STEPS.map((step, index) => {
        const completed = step.number < currentStep;
        const active = step.number === currentStep;

        return (
          <div key={step.number} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  completed || active
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {completed ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-semibold">{step.number}</span>
                )}
              </div>
              <span
                className={`text-xs mt-2 font-medium ${
                  active ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={`w-20 h-0.5 mx-2 mb-6 ${
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
