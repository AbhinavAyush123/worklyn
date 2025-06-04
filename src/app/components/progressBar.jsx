import React from 'react';
import { CheckCircle } from 'lucide-react';

export default function ProgressBar({ currentStep }) {
  const steps = [
    { number: 1, label: 'Role' },
    { number: 2, label: 'Details' },
    { number: 3, label: 'Finish' },
  ];

  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, i) => {
          const isCompleted = step.number < currentStep;
          const isActive = step.number === currentStep;

          return (
            <React.Fragment key={step.number}>
              <div className="flex flex-col items-center w-20 relative z-10">
                <div
                  className={`
                    w-9 h-9 rounded-full flex items-center justify-center
                    border-2
                    transition-colors duration-300
                    ${isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : ''}
                    ${isActive ? 'bg-blue-600 border-blue-600 text-white' : ''}
                    ${!isCompleted && !isActive ? 'bg-gray-200 border-gray-300 text-gray-500' : ''}
                  `}
                >
                  {isCompleted ? <CheckCircle size={20} /> : step.number}
                </div>
                <span
                  className={`
                    mt-2 text-xs font-semibold text-center
                    ${isCompleted || isActive ? 'text-gray-900' : 'text-gray-400'}
                  `}
                >
                  {step.label}
                </span>
              </div>

              {i < steps.length - 1 && (
                <div
                  aria-hidden="true"
                  className={`
                    flex-1 h-1 mt-4 rounded transition-colors duration-300
                    ${step.number < currentStep ? 'bg-emerald-500' : 'bg-gray-300'}
                  `}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
