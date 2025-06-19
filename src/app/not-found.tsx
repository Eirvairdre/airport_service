"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function NotFound() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
      <div className={`max-w-2xl mx-auto text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        
        {/* Анимированный самолет */}
        <div className="mb-8 relative">
          <div className="text-8xl mb-4 animate-bounce">
            ✈️
          </div>
          <div className="absolute -top-4 -right-4 text-4xl animate-pulse">
            🌍
          </div>
        </div>

        {/* Основной контент */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          <h1 className="text-6xl font-bold text-gray-800 mb-4">
            404
          </h1>
          
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Рейс не найден
          </h2>
          
          <p className="text-gray-600 mb-8 text-lg leading-relaxed">
            К сожалению, запрашиваемая страница не существует или была перемещена. 
            Возможно, вы ввели неправильный адрес или рейс уже завершен.
          </p>

          {/* Кнопки навигации */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/dashboard"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              🏠 Вернуться на главную
            </Link>
            
            <Link 
              href="/flights"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              ✈️ Посмотреть рейсы
            </Link>
          </div>

          {/* Дополнительная информация */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-4">
              Если вы считаете, что это ошибка, свяжитесь с нашей службой поддержки
            </p>
            
            <div className="flex justify-center space-x-6 text-sm">
              <Link href="/info" className="text-blue-600 hover:text-blue-800 transition-colors">
                ℹ️ Информация
              </Link>
              <Link href="/admin" className="text-blue-600 hover:text-blue-800 transition-colors">
                🔧 Админ панель
              </Link>
              <Link href="/my-tickets" className="text-blue-600 hover:text-blue-800 transition-colors">
                🎫 Мои билеты
              </Link>
            </div>
          </div>
        </div>

        {/* Декоративные элементы */}
        <div className="mt-8 flex justify-center space-x-4 text-2xl">
          <div className="animate-pulse">🛫</div>
          <div className="animate-pulse delay-100">🛬</div>
          <div className="animate-pulse delay-200">🛩️</div>
          <div className="animate-pulse delay-300">🚁</div>
        </div>

        {/* Анимированная строка статуса */}
        <div className="mt-8 bg-white rounded-lg p-4 shadow-lg border border-gray-100">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span>Статус: Страница не найдена</span>
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse delay-75"></div>
            <span>Код ошибки: 404</span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse delay-150"></div>
            <span>Система: Работает</span>
          </div>
        </div>
      </div>
    </div>
  );
} 