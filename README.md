# ServiceLinks — Сервис сокращения ссылок на Express + SQLite

## Описание

Простой сервис для сокращения ссылок с хранением переходов и статистикой. Реализован на Node.js (Express) и SQLite. Поддерживает JWT-аутентификацию для просмотра статистики.

---

## Установка

1. Клонируйте репозиторий и перейдите в папку проекта:
   ```sh
   git clone <repo_url>
   cd ServiceLinks
   ```
2. Установите зависимости:
   ```sh
   npm install
   ```
3. Создайте файл `.env` в корне проекта и добавьте:
   ```
   PORT=4000
   JWT_SECRET=your_secret_key
   ```
   (Замените `your_secret_key` на любой сложный набор символов)

---

## Запуск

```sh
npm start
```

---

## Основные эндпоинты

### 1. Создание короткой ссылки
**POST** `/shorten`

**Тело запроса:**
```json
{
  "originalUrl": "https://example.com/some/long/link"
}
```
**Ответ:**
```json
{
  "shortUrl": "http://localhost:4000/AbCdEf12"
}
```

### 2. Переход по короткой ссылке
**GET** `/:code`

- Редиректит на исходный URL
- Логирует IP и время перехода

### 3. Получение статистики (требует JWT)
**GET** `/stats/:code`

**Заголовок:**
```
Authorization: Bearer <ваш_токен>
```
**Ответ:**
```json
{
  "originalUrl": "https://example.com",
  "visits": 12,
  "firstVisit": "2025-07-05T14:23:00Z",
  "lastVisit": "2025-07-09T08:50:00Z",
  "uniqueIps": 5
}
```

### 4. Получение тестового JWT-токена
**GET** `/token`

**Ответ:**
```json
{
  "token": "..."
}
```

---

## Примеры curl-запросов

**Создать короткую ссылку:**
```sh
curl -X POST http://localhost:4000/shorten \
  -H "Content-Type: application/json" \
  -d '{"originalUrl":"https://example.com"}'
```

**Пример для YouTube:**
```sh
curl -X POST http://localhost:4000/shorten \
  -H "Content-Type: application/json" \
  -d '{"originalUrl":"https://www.youtube.com/watch?v=dQw4w9WgXcQ&ab_channel=RickAstley"}'
```
**Ответ:**
```json
{"shortUrl":"http://localhost:4000/AbCdEf12"}
```

**Перейти по короткой ссылке:**
```sh
curl -v http://localhost:4000/AbCdEf12
```

**Получить токен:**
```sh
curl http://localhost:4000/token
```

**Получить статистику:**
```sh
curl http://localhost:4000/stats/AbCdEf12 \
  -H "Authorization: Bearer <ваш_токен>"
```
