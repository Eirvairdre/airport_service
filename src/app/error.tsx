"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    // Логируем ошибку для отладки
    console.error('Ошибка приложения:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-100 flex items-center justify-center p-4">
      <div className={`max-w-2xl mx-auto text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        
        {/* Анимированный индикатор ошибки */}
        <div className="mb-8 relative">
          <div className="text-8xl mb-4 animate-pulse text-red-500">
            ⚠️
          </div>
          <div className="absolute -top-4 -right-4 text-4xl animate-bounce">
            🚨
          </div>
        </div>

        {/* Основной контент */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-red-100">
          <h1 className="text-4xl font-bold text-red-600 mb-4">
            Произошла ошибка
          </h1>
          
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Система временно недоступна
          </h2>
          
          <p className="text-gray-600 mb-6 text-lg leading-relaxed">
            К сожалению, произошла непредвиденная ошибка в работе приложения. 
            Наша команда уже работает над её устранением.
          </p>

          {/* Информация об ошибке (только в режиме разработки) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-red-700 font-mono break-all">
                <strong>Ошибка:</strong> {error.message}
              </p>
              {error.digest && (
                <p className="text-xs text-red-600 mt-2">
                  <strong>Digest:</strong> {error.digest}
                </p>
              )}
            </div>
          )}

          {/* Кнопки действий */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <button
              onClick={reset}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              🔄 Попробовать снова
            </button>
            
            <Link 
              href="/dashboard"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              🏠 Вернуться на главную
            </Link>
          </div>

          {/* Дополнительная информация */}
          <div className="pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-4">
              Если проблема повторяется, попробуйте:
            </p>
            
            <div className="text-sm text-gray-600 space-y-2">
              <div className="flex items-center justify-center space-x-2">
                <span>🔄</span>
                <span>Обновить страницу</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <span>🧹</span>
                <span>Очистить кэш браузера</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <span>⏰</span>
                <span>Попробовать позже</span>
              </div>
            </div>
          </div>
        </div>

        {/* Декоративные элементы */}
        <div className="mt-8 flex justify-center space-x-4 text-2xl">
          <div className="animate-pulse text-red-400">🛠️</div>
          <div className="animate-pulse text-orange-400 delay-100">🔧</div>
          <div className="animate-pulse text-yellow-400 delay-200">⚙️</div>
          <div className="animate-pulse text-green-400 delay-300">✅</div>
        </div>

        {/* Анимированная строка статуса */}
        <div className="mt-8 bg-white rounded-lg p-4 shadow-lg border border-red-100">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span>Статус: Ошибка системы</span>
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse delay-75"></div>
            <span>Время: {new Date().toLocaleTimeString()}</span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse delay-150"></div>
            <span>Поддержка: Активна</span>
          </div>
        </div>
      </div>
    </div>
  );
} 