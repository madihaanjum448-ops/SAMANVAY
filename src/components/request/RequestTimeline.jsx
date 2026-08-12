import React from 'react';
import { Check, Circle } from 'lucide-react';

export default function RequestTimeline({ status }) {
  const steps = ['INITIATED', 'ACKNOWLEDGED', 'DEPLOYED', 'RESOLVED'];
  const currentIdx = steps.indexOf(status);

  return (
    <div className="flex items-center w-full my-3">
      {steps.map((step, idx) => {
        const isDone = idx < currentIdx;
        const isActive = idx === currentIdx;
        const isPending = idx > currentIdx;

        return (
          <React.Fragment key={step}>
            {/* Step Node */}
            <div className="flex flex-col items-center relative z-10">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                  isDone
                    ? 'bg-green-50 border-green-500 text-green-700'
                    : isActive
                    ? 'bg-teal-50 border-teal-600 text-teal-700 font-bold'
                    : 'bg-stone-50 border-stone-300 text-stone-400'
                }`}
              >
                {isDone ? (
                  <Check size={12} className="stroke-[3]" />
                ) : (
                  <span className="text-[10px] font-mono font-bold">{idx + 1}</span>
                )}
              </div>
              <span
                className={`text-[9px] font-semibold mt-1.5 uppercase tracking-wider ${
                  isActive ? 'text-teal-700 font-extrabold' : isDone ? 'text-green-700' : 'text-stone-500'
                }`}
              >
                {step}
              </span>
            </div>

            {/* Connecting Line */}
            {idx < steps.length - 1 && (
              <div
                className={`flex-1 h-[2px] -mt-4 transition-all duration-300 ${
                  idx < currentIdx ? 'bg-green-600' : 'bg-stone-200'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
