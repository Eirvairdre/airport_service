# Система управления аэропортом

Это мой проект для экзамена по предмету "Проектирование и разработка баз данных". Делаю полноценную систему управления аэропортом с веб-интерфейсом.

## Описание проекта

Система предназначена для автоматизации процессов управления аэропортом:
- Учет и управление рейсами
- Контроль технического состояния воздушных судов
- Управление персоналом и экипажами
- Обработка пассажирских данных
- Мониторинг инцидентов и безопасности

## Архитектура базы данных

### Основные сущности:
- **Аэропорты** - информация о воздушных гаванях
- **Авиакомпании** - операторы воздушных перевозок
- **Воздушные суда** - парк самолетов с характеристиками
- **Рейсы** - расписание и статусы полетов
- **Персонал** - сотрудники аэропорта и авиакомпаний
- **Пассажиры** - данные о пассажирах
- **Билеты** - информация о продажах
- **Техобслуживание** - контроль технического состояния
- **Инциденты** - учет происшествий и нарушений

### Связи между сущностями:
- Рейсы связаны с аэропортами (вылет/прилет)
- Самолеты принадлежат авиакомпаниям
- Экипажи назначаются на рейсы
- Билеты привязаны к рейсам и пассажирам
- Техобслуживание проводится на конкретных самолетах

## Технологический стек

### Backend:
- **Next.js 14** - React фреймворк с App Router
- **Prisma ORM** - работа с базой данных
- **MySQL** - реляционная СУБД
- **NextAuth.js** - система аутентификации

### Frontend:
- **React 19** - пользовательский интерфейс
- **Tailwind CSS** - стилизация
- **Chart.js** - визуализация данных

### Инструменты разработки:
- **TypeScript** - типизация
- **ESLint** - линтинг кода
- **Prisma Studio** - администрирование БД

## Структура базы данных

```
airport_db/
├── User                    # Пользователи системы
├── Airport                 # Аэропорты
├── Terminal                # Терминалы
├── Gate                    # Ворота
├── Stand                   # Стоянки
├── Aircraft_Type           # Типы воздушных судов
├── Airline                 # Авиакомпании
├── Aircraft                # Воздушные суда
├── Flight                  # Рейсы
├── Flight_Schedule         # Расписание рейсов
├── Passenger               # Пассажиры
├── Ticket                  # Билеты
├── Personnel               # Персонал
├── Crew                    # Экипажи
├── Crew_Member             # Члены экипажа
├── Checkin                 # Регистрация
├── Baggage                 # Багаж
├── Maintenance             # Техобслуживание
├── Maintenance_Log         # Логи техобслуживания
└── Incident                # Инциденты
```

## Установка и запуск

### Предварительные требования:
- Node.js 18+
- MySQL 8.0+
- npm или yarn

### Пошаговая установка:

1. **Клонирование репозитория:**
```bash
git clone <repository-url>
cd asm
```

2. **Установка зависимостей:**
```bash
npm install
```

3. **Настройка базы данных:**
```bash
# Создайте базу данных MySQL
mysql -u root -p
CREATE DATABASE airport_db;
```

4. **Конфигурация окружения:**
Создайте файл `.env` в корне проекта:
```env
DATABASE_URL="mysql://username:password@localhost:3306/airport_db"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

5. **Применение миграций:**
```bash
npx prisma migrate dev --name init
```

6. **Заполнение тестовыми данными:**
```bash
npx prisma db seed
```

7. **Запуск приложения:**
```bash
npm run dev
```

8. **Открытие в браузере:**
Перейдите по адресу [http://localhost:3000](http://localhost:3000)

## Доступ к системе

### Администратор:
- **Email:** `admin@admin.com`
- **Пароль:** `admin123`

### Функции администратора:
- Полный доступ ко всем модулям системы
- Управление пользователями
- Просмотр аналитики и отчетов
- Настройка системы

## Функциональные модули

### 1. Управление рейсами
- Создание и редактирование рейсов
- Отслеживание статусов (запланирован, задержан, отменен, завершен)
- Назначение воздушных судов и экипажей
- Управление расписанием

### 2. Управление воздушными судами
- Учет парка самолетов
- Контроль технического состояния
- Планирование техобслуживания
- Привязка к авиакомпаниям

### 3. Управление персоналом
- База данных сотрудников
- Назначение экипажей на рейсы
- Учет квалификации и лицензий
- Контроль рабочего времени

### 4. Пассажирский сервис
- Регистрация пассажиров
- Продажа и учет билетов
- Обработка багажа
- Информационное обслуживание

### 5. Безопасность и контроль
- Учет инцидентов
- Классификация по уровням серьезности
- Отчетность по безопасности
- Мониторинг нарушений

### 6. Аналитика и отчеты
- Статистика по рейсам
- Анализ загрузки аэропортов
- Отчеты по техобслуживанию
- Мониторинг инцидентов

## Особенности реализации

### Нормализация данных:
- Применены правила нормализации до 3NF
- Устранены избыточные данные
- Оптимизированы связи между таблицами

### Целостность данных:
- Первичные и внешние ключи
- Ограничения NOT NULL
- Проверочные ограничения
- Каскадные операции

### Производительность:
- Индексы на часто используемых полях
- Оптимизированные запросы
- Пагинация для больших объемов данных

### Безопасность:
- Аутентификация пользователей
- Авторизация по ролям
- Валидация входных данных
- Защита от SQL-инъекций

## Тестовые данные

Система поставляется с набором тестовых данных:
- 5 аэропортов России
- 5 авиакомпаний
- 5 типов воздушных судов
- 5 самолетов
- 5 рейсов
- 5 пассажиров
- 5 сотрудников
- Техобслуживание и инциденты

## Документация API

### Основные эндпоинты:
- `GET /api/flights` - список рейсов
- `POST /api/flights` - создание рейса
- `GET /api/aircraft` - список самолетов
- `GET /api/maintenance` - техобслуживание
- `GET /api/incidents` - инциденты

### Аутентификация:
Все API запросы требуют валидного JWT токена в заголовке Authorization.

## Развертывание

### Локальная разработка:
```bash
npm run dev
```

### Продакшн сборка:
```bash
npm run build
npm start
```

### Docker (опционально):
```bash
docker build -t airport-system .
docker run -p 3000:3000 airport-system
```

## Мониторинг и логирование

- Логирование всех операций с базой данных
- Отслеживание ошибок и исключений
- Мониторинг производительности запросов
- Аудит действий пользователей

## Планы развития

### Краткосрочные задачи:
- [ ] Добавление мобильной версии
- [ ] Интеграция с внешними API погоды
- [ ] Система уведомлений
- [ ] Экспорт отчетов в PDF

### Долгосрочные планы:
- [ ] Интеграция с системами бронирования
- [ ] Машинное обучение для прогнозирования задержек
- [ ] IoT датчики для мониторинга самолетов
- [ ] Блокчейн для учета запчастей

## Контакты

**Автор:** [Лысенко Александр Дмитриевич]
**Предмет:** Проектирование и разработка баз данных
**Группа:** [231-364]
**Год:** 2025

По вопросам проекта обращайтесь к автору или создавайте issues в репозитории.
