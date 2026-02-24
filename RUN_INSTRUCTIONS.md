# راهنمای اجرای سیستم WebUI User Management

## پیش‌نیازها

### نرم‌افزارهای مورد نیاز
- **Python 3.8+** - برای بک‌اند
- **Node.js 16+** - برای فرانت‌اند
- **PostgreSQL** - پایگاه داده
- **Redis** - برای Rate Limiting (اختیاری)

### بررسی نصب نرم‌افزارها
```bash
# بررسی Python
python --version
# باید نسخه 3.8 یا بالاتر باشد

# بررسی Node.js
node --version
# باید نسخه 16 یا بالاتر باشد

# بررسی npm
npm --version
```

## مراحل نصب و اجرا

### 1. نصب و راه‌اندازی بک‌اند (Backend)

#### نصب وابستگی‌ها
```bash
cd WebUI_UserManagement/backend
pip install -r requirements.txt
```

#### تنظیم محیط (Environment)
```bash
# کپی کردن فایل تنظیمات
cp .env.example .env

# ویرایش فایل تنظیمات
notepad .env
# یا در لینوکس/مک:
# nano .env
```

#### تنظیمات پایه در فایل .env
```env
# تنظیمات پایگاه داده
DATABASE_URL=postgresql://username:password@localhost:5432/webui_usermanagement

# تنظیمات JWT
SECRET_KEY=your-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# تنظیمات Redis (اختیاری)
REDIS_URL=redis://localhost:6379/0
```

#### ایجاد پایگاه داده
1. **نصب PostgreSQL** (اگر نصب نیست):
   - ویندوز: دانلود از [postgresql.org](https://www.postgresql.org/download/windows/)
   - لینوکس: `sudo apt install postgresql postgresql-contrib`
   - مک: `brew install postgresql`

2. **ایجاد دیتابیس**:
```bash
# وارد شدن به psql
psql -U postgres

# ایجاد دیتابیس جدید
CREATE DATABASE webui_usermanagement;

# ایجاد کاربر (اختیاری)
CREATE USER your_username WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE webui_usermanagement TO your_username;

# خارج شدن از psql
\q
```

3. **ایجاد جداول دیتابیس**:
```bash
# اجرای اسکریپت ایجاد جداول
python -c "from database.database import engine; from database.models import Base; Base.metadata.create_all(bind=engine)"
```

#### راه‌اندازی سرور بک‌اند
```bash
# راه‌اندازی سرور توسعه
python main.py

# سرور روی آدرس زیر قابل دسترسی است:
# http://localhost:8000
```

### 2. نصب و راه‌اندازی فرانت‌اند (Frontend)

#### نصب وابستگی‌ها
```bash
cd WebUI_UserManagement/frontend
npm install
```

#### راه‌اندازی سرور توسعه
```bash
# راه‌اندازی سرور توسعه
npm run dev

# فرانت‌اند روی آدرس زیر قابل دسترسی است:
# http://localhost:5173
```

## تست سیستم

### تست بک‌اند
1. **باز کردن مرورگر** و رفتن به آدرس:
   ```
   http://localhost:8000
   ```

2. **دسترسی به مستندات API**:
   ```
   http://localhost:8000/docs
   ```

3. **تست اپراتورها**:
   - ثبت نام کاربر جدید
   - ورود به سیستم
   - ایجاد پلن اشتراک
   - ایجاد اشتراک برای کاربر

### تست فرانت‌اند
1. **باز کردن مرورگر** و رفتن به آدرس:
   ```
   http://localhost:5173
   ```

2. **صفحات قابل دسترسی**:
   - `/login` - صفحه ورود
   - `/register` - صفحه ثبت نام
   - `/` - داشبورد اصلی (نیاز به ورود)
   - `/profile` - تنظیمات پروفایل
   - `/subscriptions` - مدیریت اشتراک‌ها
   - `/chat` - چت با مدل‌های AI

## مشکلات رایج و راه‌حل‌ها

### مشکل: خطای اتصال به دیتابیس
```bash
# بررسی اینکه PostgreSQL در حال اجراست
# ویندوز: Services → PostgreSQL
# لینوکس: sudo systemctl status postgresql
# مک: brew services list | grep postgresql
```

### مشکل: خطای وابستگی‌ها
```bash
# حذف و نصب مجدد وابستگی‌ها
cd backend
rm -rf venv
python -m venv venv
source venv/bin/activate  # لینوکس/مک
# یا
venv\Scripts\activate     # ویندوز
pip install -r requirements.txt
```

### مشکل: پورت اشغال شده
```bash
# تغییر پورت در main.py
# خط: uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
# تغییر port=8000 به port=8001 یا هر پورت دیگر
```

### مشکل: CORS (عدم ارتباط فرانت‌اند و بک‌اند)
- فرانت‌اند به صورت خودکار روی `http://localhost:5173` و بک‌اند روی `http://localhost:8000` اجرا می‌شوند
- CORS در بک‌اند فعال است و ارتباط بین دو سرویس را پشتیبانی می‌کند

## ساختار پوشه‌ها

```
WebUI_UserManagement/
├── backend/
│   ├── main.py              # نقطه شروع بک‌اند
│   ├── requirements.txt     # وابستگی‌های پایتون
│   ├── .env                 # تنظیمات محیط
│   ├── api/                 # API endpoints
│   ├── database/            # مدل‌ها و تنظیمات دیتابیس
│   ├── services/            # لایه سرویس
│   └── models/              # Schemaها
├── frontend/
│   ├── package.json         # وابستگی‌های npm
│   ├── vite.config.js       # تنظیمات Vite
│   ├── src/
│   │   ├── main.jsx         # نقطه شروع فرانت‌اند
│   │   ├── App.jsx          # کامپوننت اصلی
│   │   ├── pages/           # صفحات مختلف
│   │   ├── components/      # کامپوننت‌های قابل استفاده مجدد
│   │   └── contexts/        # Contextهای React
└── README.md                # مستندات کامل
```

## اجرای سریع (Quick Start)

### فقط بک‌اند
```bash
cd WebUI_UserManagement/backend
pip install -r requirements.txt
python main.py
```

### فقط فرانت‌اند
```bash
cd WebUI_UserManagement/frontend
npm install
npm run dev
```

### هر دو سرویس (در دو ترمینال جداگانه)
```bash
# ترمینال 1 - بک‌اند
cd WebUI_UserManagement/backend
pip install -r requirements.txt
python main.py

# ترمینال 2 - فرانت‌اند
cd WebUI_UserManagement/frontend
npm install
npm run dev
```

## تست کامل سیستم

1. **باز کردن فرانت‌اند**: http://localhost:5173
2. **ثبت نام کاربر جدید**
3. **ورود به سیستم**
4. **ایجاد اشتراک** (نیاز به ادمین دارد)
5. **استفاده از چت** با مدل‌های مختلف
6. **مشاهده مانده حساب** و تراکنش‌ها

## پشتیبانی

برای مشکلات بیشتر:
- بررسی لاگ‌های ترمینال
- بررسی مستندات در `README.md`
- بررسی تنظیمات در `.env` فایل