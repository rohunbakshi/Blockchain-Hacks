import { LucideIcon } from 'lucide-react';
import { Button } from './ui/button';
import { ReactNode } from 'react';

interface ActionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  buttonText: string;
  buttonVariant?: 'default' | 'outline';
  onAction: () => void;
  children?: ReactNode;
}

export function ActionCard({
  icon: Icon,
  title,
  description,
  buttonText,
  buttonVariant = 'default',
  onAction,
  children,
}: ActionCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      {/* Icon */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center flex-shrink-0">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-[#111827]">{title}</h3>
      </div>

      {/* Description */}
      <p className="text-sm text-[#6b7280] mb-4">{description}</p>

      {/* Additional Content */}
      {children && <div className="mb-4">{children}</div>}

      {/* Action Button */}
      <Button
        className={
          buttonVariant === 'default'
            ? 'w-full bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:opacity-90 transition-opacity text-white border-0'
            : 'w-full border-[#667eea] text-[#667eea] hover:bg-[#667eea] hover:text-white transition-colors'
        }
        variant={buttonVariant}
        onClick={onAction}
      >
        {buttonText}
      </Button>
    </div>
  );
}
