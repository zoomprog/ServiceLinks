# ServiceLinks — Сервис сокращения ссылок на Express + SQLite

## Описание

Простой сервис для сокращения ссылок с хранением переходов и статистикой. Реализован на Node.js (Express) и SQLite. Поддерживает JWT-аутентификацию для просмотра статистики. Есть поддержка TTL (срока жизни ссылок) и CORS.

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
   JWT_SECRET=8f2b1c4e5d6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c
   DEFAULT_TTL_HOURS=200
   CORS_ORIGIN=*
   ```
   - `DEFAULT_TTL_HOURS` — срок жизни ссылки по умолчанию (в часах, 168 = 7 дней)
   - `CORS_ORIGIN` — разрешённые домены для CORS (например, `*` или `https://yourdomain.com`)

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
  "originalUrl": "https://example.com/some/long/link",
  "ttl": 24 // (необязательно, срок жизни в часах)
}
```
**Ответ:**
```json
{
  "shortUrl": "http://localhost:4000/AbCdEf12",
  "expiresAt": "2025-07-22T12:00:00.000Z"
}
```

### 2. Переход по короткой ссылке
**GET** `/:code`

- Редиректит на исходный URL (если не истёк TTL)
- Логирует IP и время перехода
- Если срок жизни истёк — возвращает 404

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
  "uniqueIps": 5,
  "expiresAt": "2025-07-22T12:00:00.000Z"
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

**Создать короткую ссылку с TTL 1 час:**
```sh
curl -X POST http://localhost:4000/shorten \
  -H "Content-Type: application/json" \
  -d '{"originalUrl":"https://example.com", "ttl":1}'
```

**Создать короткую ссылку (TTL по умолчанию):**
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
{"shortUrl":"http://localhost:4000/AbCdEf12", "expiresAt": "2025-07-22T12:00:00.000Z"}
```

**Перейти по короткой ссылке:**
```sh
curl -v http://localhost:4000/AbCdEf12
```

**Получить токен:**
```sh
curl http://localhost:4000/token
```

**Получить статистику по короткой ссылке:**
```sh
curl http://localhost:4000/stats/AbCdEf12 \
  -H "Authorization: Bearer <ваш_токен>"
```

# Bash-последовательность для проверки GET /stats/:code

```sh
# Получить токен
TOKEN=$(curl -s http://localhost:4000/token | jq -r .token)

# Получить статистику по короткой ссылке (замените AbCdEf12 на ваш код)
curl http://localhost:4000/stats/AbCdEf12 \
  -H "Authorization: Bearer $TOKEN"
```



