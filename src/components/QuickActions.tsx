"use client";
import Link from "next/link";

interface QuickActionsProps {
  isAdmin?: boolean;
}

// Компонент быстрых действий - кнопки для быстрого доступа к основным функциям
export default function QuickActions({ isAdmin = false }: QuickActionsProps) {
  // Действия для админа - полный доступ ко всем функциям
  const adminActions = [
    {
      title: "Добавить рейс",
      description: "Создать новый рейс",
      href: "/admin/flights",
      icon: "✈️",
      color: "blue"
    },
    {
      title: "Регистрация пассажира",
      description: "Зарегистрировать пассажира на рейс",
      href: "/admin/checkins",
      icon: "🎫",
      color: "green"
    },
    {
      title: "Создать инцидент",
      description: "Зафиксировать инцидент",
      href: "/admin/incidents",
      icon: "🚨",
      color: "red"
    },
    {
      title: "Назначить обслуживание",
      description: "Запланировать техническое обслуживание",
      href: "/admin/maintenance",
      icon: "🔧",
      color: "orange"
    },
    {
      title: "Управление экипажем",
      description: "Назначить экипаж на рейс",
      href: "/admin/crews",
      icon: "👥",
      color: "purple"
    },
    {
      title: "Добавить пользователя",
      description: "Создать нового пользователя системы",
      href: "/admin/users",
      icon: "👤",
      color: "indigo"
    }
  ];

  // Действия для обычных пользователей - ограниченный функционал
  const userActions = [
    {
      title: "Просмотр рейсов",
      description: "Посмотреть расписание рейсов",
      href: "/flights",
      icon: "✈️",
      color: "blue"
    },
    {
      title: "Мои билеты",
      description: "Просмотреть мои билеты",
      href: "/my-tickets",
      icon: "🎫",
      color: "green"
    },
    {
      title: "Регистрация",
      description: "Зарегистрироваться на рейс",
      href: "/checkin",
      icon: "📋",
      color: "purple"
    },
    {
      title: "Информация",
      description: "Информация об аэропорте",
      href: "/info",
      icon: "ℹ️",
      color: "gray"
    }
  ];

  // Выбираю нужный набор действий в зависимости от роли
  const actions = isAdmin ? adminActions : userActions;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {isAdmin ? "Быстрые действия администратора" : "Быстрые действия"}
      </h3>
      {/* Сетка кнопок - адаптивная, от 2 до 6 колонок */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {actions.map((action) => (
          <Link
            key={action.title}
            href={action.href}
            className={`group block p-4 rounded-lg border-2 border-${action.color}-200 hover:border-${action.color}-500 hover:bg-${action.color}-50 transition-all duration-200 text-center`}
          >
            {/* Иконка с анимацией при наведении */}
            <div className={`text-3xl mb-2 group-hover:scale-110 transition-transform duration-200`}>
              {action.icon}
            </div>
            <h4 className={`font-semibold text-${action.color}-700 text-sm mb-1`}>
              {action.title}
            </h4>
            <p className="text-xs text-gray-500">
              {action.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
} 