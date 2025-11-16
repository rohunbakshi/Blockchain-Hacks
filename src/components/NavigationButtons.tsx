import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { useRouter } from './Router';

interface NavigationButtonsProps {
  showBack?: boolean;
  showForward?: boolean;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg' | 'icon';
}

export function NavigationButtons({ 
  showBack = true, 
  showForward = true,
  className = '',
  variant = 'outline',
  size = 'icon'
}: NavigationButtonsProps) {
  const { goBack, goForward, canGoBack, canGoForward } = useRouter();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showBack && (
        <Button
          variant={variant}
          size={size}
          onClick={goBack}
          disabled={!canGoBack}
          className="disabled:opacity-50 disabled:cursor-not-allowed"
          title="Go back"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
      )}
      {showForward && (
        <Button
          variant={variant}
          size={size}
          onClick={goForward}
          disabled={!canGoForward}
          className="disabled:opacity-50 disabled:cursor-not-allowed"
          title="Go forward"
        >
          <ArrowRight className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}

