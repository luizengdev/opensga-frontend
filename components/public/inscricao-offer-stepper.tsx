import {Check} from "lucide-react";

interface InscricaoOfferStepperProps {
  current: 1 | 2 | 3;
  labels: [string, string, string];
}

export const InscricaoOfferStepper = ({
  current,
  labels,
}: InscricaoOfferStepperProps) => {
  return (
    <div className="grid grid-cols-3 gap-2">
      {labels.map((label, index) => {
        const step = (index + 1) as 1 | 2 | 3;
        const isDone = current > step;
        const isCurrent = current === step;

        return (
          <div key={label} className="flex flex-col items-center gap-2 text-center">
            <span
              className={
                isDone || isCurrent
                  ? "flex size-8 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white"
                  : "flex size-8 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-500"
              }
            >
              {isDone ? <Check className="size-4" /> : step}
            </span>
            <span
              className={
                isCurrent
                  ? "text-[11px] font-medium text-slate-900"
                  : "text-[11px] text-slate-500"
              }
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
};
