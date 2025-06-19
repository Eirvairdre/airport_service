# Страницы ошибок и компоненты загрузки

## Обзор

В приложении реализована полная система обработки ошибок и состояний загрузки с красивым дизайном в стиле аэропорта.

## Страницы ошибок

### 1. Страница 404 (`src/app/not-found.tsx`)
- **Назначение**: Отображается при переходе на несуществующие страницы
- **Особенности**:
  - Анимированный самолет и глобус
  - Кнопки навигации на главную и рейсы
  - Анимированная строка статуса
  - Адаптивный дизайн

### 2. Глобальная страница ошибки (`src/app/error.tsx`)
- **Назначение**: Обрабатывает runtime ошибки в приложении
- **Особенности**:
  - Отображение деталей ошибки в режиме разработки
  - Кнопка "Попробовать снова" для сброса ошибки
  - Рекомендации по устранению проблем
  - Анимированные индикаторы статуса

### 3. Страница загрузки (`src/app/loading.tsx`)
- **Назначение**: Отображается во время загрузки страниц
- **Особенности**:
  - Анимированный самолет
  - Индикаторы загрузки
  - Статус подключения к серверу

## Компоненты

### LoadingSpinner (`src/components/LoadingSpinner.tsx`)

#### Основной компонент
```tsx
<LoadingSpinner 
  size="md" 
  text="Загрузка..." 
  variant="default" 
/>
```

#### Варианты:
- `default` - классический спиннер
- `airplane` - анимированный самолет
- `dots` - анимированные точки

#### Размеры:
- `sm` - маленький
- `md` - средний (по умолчанию)
- `lg` - большой

#### Специализированные компоненты:

1. **FullPageLoader** - для полной страницы
```tsx
<FullPageLoader text="Загрузка приложения..." />
```

2. **CardLoader** - для карточек
```tsx
<CardLoader text="Загрузка данных..." />
```

3. **TableLoader** - для таблиц
```tsx
<TableLoader rows={5} />
```

### ErrorBoundary (`src/components/ErrorBoundary.tsx`)

#### Классовый компонент для обработки ошибок:
```tsx
<ErrorBoundary fallback={<CustomErrorComponent />}>
  <YourComponent />
</ErrorBoundary>
```

#### Хук для функциональных компонентов:
```tsx
const { error, handleError, clearError } = useErrorHandler();

// Обработка ошибки
try {
  // ваш код
} catch (err) {
  handleError(err);
}

// Отображение ошибки
if (error) {
  return <ErrorDisplay error={error} onRetry={clearError} />;
}
```

#### Компонент ErrorDisplay:
```tsx
<ErrorDisplay 
  error={error} 
  onRetry={() => retryFunction()} 
/>
```

## Использование в проекте

### 1. В существующих компонентах

Замените простые индикаторы загрузки:
```tsx
// Было
{loading && <div>Загрузка...</div>}

// Стало
{loading && <LoadingSpinner variant="airplane" text="Загрузка рейсов..." />}
```

### 2. Обработка ошибок в API

```tsx
const [error, setError] = useState<Error | null>(null);

try {
  const data = await fetchData();
  setData(data);
} catch (err) {
  setError(err as Error);
}

if (error) {
  return <ErrorDisplay error={error} onRetry={() => fetchData()} />;
}
```

### 3. Обертывание компонентов в ErrorBoundary

```tsx
<ErrorBoundary>
  <FlightsList />
</ErrorBoundary>
```

## Стили и анимации

### Цветовая схема:
- **Синий** - основная тема аэропорта
- **Красный** - ошибки
- **Зеленый** - успех
- **Желтый** - предупреждения

### Анимации:
- `animate-bounce` - для самолетов
- `animate-pulse` - для индикаторов
- `animate-spin` - для спиннеров
- `delay-*` - для последовательных анимаций

## Рекомендации

1. **Используйте специализированные компоненты** для разных контекстов
2. **Обрабатывайте ошибки** на всех уровнях приложения
3. **Предоставляйте пользователю** возможность повторить действие
4. **Логируйте ошибки** для отладки
5. **Используйте консистентные** тексты и иконки

## Примеры интеграции

### В админ-панели:
```tsx
{loading ? (
  <CardLoader text="Загрузка данных..." />
) : error ? (
  <ErrorDisplay error={error} onRetry={fetchData} />
) : (
  <DataTable data={data} />
)}
```

### В формах:
```tsx
<button 
  disabled={submitting} 
  className="btn-primary"
>
  {submitting ? (
    <LoadingSpinner size="sm" variant="dots" />
  ) : (
    'Сохранить'
  )}
</button>
``` 