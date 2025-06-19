interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  variant?: 'default' | 'airplane' | 'dots';
}

export default function LoadingSpinner({ 
  size = 'md', 
  text = 'Загрузка...', 
  variant = 'default' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  if (variant === 'airplane') {
    return (
      <div className="flex flex-col items-center justify-center space-y-2">
        <div className="text-4xl animate-bounce">
          ✈️
        </div>
        {text && (
          <p className={`text-gray-600 ${textSizes[size]}`}>
            {text}
          </p>
        )}
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div className="flex flex-col items-center justify-center space-y-2">
        <div className="flex space-x-1">
          <div className={`${sizeClasses[size]} bg-blue-600 rounded-full animate-bounce`}></div>
          <div className={`${sizeClasses[size]} bg-blue-600 rounded-full animate-bounce delay-100`}></div>
          <div className={`${sizeClasses[size]} bg-blue-600 rounded-full animate-bounce delay-200`}></div>
          <div className={`${sizeClasses[size]} bg-blue-600 rounded-full animate-bounce delay-300`}></div>
        </div>
        {text && (
          <p className={`text-gray-600 ${textSizes[size]}`}>
            {text}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div className={`${sizeClasses[size]} border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin`}></div>
      {text && (
        <p className={`text-gray-600 ${textSizes[size]}`}>
          {text}
        </p>
      )}
    </div>
  );
}

// Компонент для полной страницы загрузки
export function FullPageLoader({ text = 'Загрузка приложения...' }: { text?: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" text={text} variant="airplane" />
        
        {/* Дополнительные декоративные элементы */}
        <div className="mt-8 flex justify-center space-x-4 text-xl">
          <div className="animate-pulse">🛫</div>
          <div className="animate-pulse delay-75">🛬</div>
          <div className="animate-pulse delay-150">🛩️</div>
        </div>
      </div>
    </div>
  );
}

// Компонент для загрузки в карточке
export function CardLoader({ text = 'Загрузка данных...' }: { text?: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <LoadingSpinner size="md" text={text} />
    </div>
  );
}

// Компонент для загрузки в таблице
export function TableLoader({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3"></div>
      </div>
      <div className="divide-y divide-gray-200">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="p-4">
            <div className="flex space-x-4">
              <div className="h-4 bg-gray-200 rounded animate-pulse flex-1"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/6"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 