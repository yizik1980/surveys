# מערכת ניהול סקרים — Monorepo

## מבנה הפרויקט

```
surveys/
├── client/          # React 19 + Vite + @preact/signals-react + Tailwind
└── server/          # NestJS + MongoDB + JWT + Nodemailer
```

## דרישות מקדימות

- Node.js 20+
- MongoDB פועל לוקלית על פורט 27017

## הפעלה מהירה

```bash
# 1. התקן תלויות
npm install         # root
cd server && npm install
cd ../client && npm install

# 2. הגדר משתני סביבה
cp .env.example server/.env
# ערוך את server/.env לפי הצורך

# 3. הפעל הכל ביחד (מה-root)
npm run dev
```

- Client: http://localhost:5173
- Server API: http://localhost:3003/api

## יצירת משתמש מנהל ראשון

```bash
curl -X POST http://localhost:3003/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "מנהל",
    "lastName": "ראשי",
    "email": "admin@surveys.com",
    "password": "Admin1234",
    "phone": "050-0000000",
    "role": "admin"
  }'
```

## API Endpoints

### Auth
| Method | Path | תיאור |
|--------|------|-------|
| POST | /api/auth/register | הרשמה |
| POST | /api/auth/login | התחברות |
| GET  | /api/auth/me | פרטי המשתמש הנוכחי |

### Users (Admin בלבד)
| Method | Path | תיאור |
|--------|------|-------|
| GET | /api/users | רשימת משתמשים |
| POST | /api/users | יצירת משתמש |
| PUT | /api/users/:id | עדכון משתמש |
| DELETE | /api/users/:id | מחיקת משתמש |

### Surveys
| Method | Path | תיאור |
|--------|------|-------|
| GET | /api/surveys | רשימת סקרים |
| POST | /api/surveys | יצירת סקר |
| PUT | /api/surveys/:id | עדכון סקר |
| DELETE | /api/surveys/:id | מחיקת סקר |
| POST | /api/surveys/:id/assign | שליחת סקר למוענים |
| GET | /api/surveys/by-token/:token | קבלת סקר לפי טוקן (ציבורי) |

### Responses
| Method | Path | תיאור |
|--------|------|-------|
| POST | /api/responses | שליחת תשובות לסקר |
| GET | /api/responses/survey/:id | תשובות לסקר |
| GET | /api/responses/survey/:id/stats | סטטיסטיקות |

## מעבר ל-MongoDB מרוחק

ב-`server/.env` שנה:
```
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/surveys
```

## סוגי משתמשים

| תפקיד | הרשאות |
|-------|--------|
| `admin` | ניהול מלא — משתמשים, סקרים, CRM |
| `surveyor` | יצירת סקרים, CRM, שליחה לנסקרים |
| `surveyed` | מילוי סקרים בלבד (דרך קישור מייל) |
