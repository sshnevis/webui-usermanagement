# راهنمای اجرای Docker برای WebUI User Management

## 🐳 اجرای سیستم با Docker

این سیستم به صورت کامل برای اجرا در محیط Docker آماده شده است. شما می‌توانید کل سیستم را با یک دستور اجرا کنید.

### پیش‌نیازها

- **Docker** (نسخه 20.10+)
- **Docker Compose** (نسخه 2.0+)

### روش اول: استفاده از اسکریپت اجرای خودکار

```bash
# دانلود و اجرای اسکریپت
chmod +x docker-run.sh
./docker-run.sh
```

### روش دوم: اجرای دستی با Docker Compose

```bash
# ساخت و اجرای تمام سرویس‌ها
docker-compose up -d --build

# برای مشاهده لاگ‌ها
docker-compose logs -f

# برای توقف سرویس‌ها
docker-compose down
```

## 🏗️ ساختار Docker

### سرویس‌های استقرار یافته

1. **PostgreSQL Database**
   - نام کانتینر: `webui_usermanagement_postgres`
   - پورت: 5432
   - حجم داده: `postgres_data`

2. **Redis (Rate Limiting)**
   - نام کانتینر: `webui_usermanagement_redis`
   - پورت: 6379
   - حجم داده: `redis_data`

3. **Backend API (FastAPI)**
   - نام کانتینر: `webui_usermanagement_backend`
   - پورت: 8000
   - محیط: Python 3.11

4. **Frontend (React)**
   - نام کانتینر: `webui_usermanagement_frontend`
   - پورت: 3000
   - محیط: Node.js 18 + Nginx

5. **Nginx (Reverse Proxy - اختیاری)**
   - نام کانتینر: `webui_usermanagement_nginx`
   - پورت: 80, 443

## 🌐 آدرس‌های دسترسی

پس از اجرای سیستم، می‌توانید به آدرس‌های زیر دسترسی داشته باشید:

- **فرانت‌اند**: http://localhost:3002
- **بک‌اند API**: http://localhost:8000
- **مستندات API**: http://localhost:8000/docs
- **صفحه ورود**: http://localhost:3002/login

## 📋 دستورات Docker Compose

### مدیریت سرویس‌ها
```bash
# مشاهده وضعیت سرویس‌ها
docker-compose ps

# مشاهده لاگ‌ها
docker-compose logs -f

# توقف سرویس‌ها
docker-compose down

# ریستارت سرویس‌ها
docker-compose restart

# ساخت مجدد و اجرا
docker-compose up -d --build
```

### مدیریت کانتینرها
```bash
# مشاهده تمام کانتینرها
docker ps -a

# ورود به کانتینر
docker exec -it webui_usermanagement_backend bash

# مشاهده لاگ یک کانتینر خاص
docker logs webui_usermanagement_backend
```

### مدیریت ایمیج‌ها
```bash
# مشاهده ایمیج‌ها
docker images

# حذف ایمیج‌ها
docker rmi image_name

# پاکسازی تمام چیزهای غیرضروری
docker system prune -a
```

## 🔧 تنظیمات محیط

### تنظیمات پیش‌فرض
سیستم با تنظیمات پیش‌فرض اجرا می‌شود که برای محیط توسعه مناسب است:

- **دیتابیس**: PostgreSQL با نام کاربری `webui_user` و رمز `webui_password`
- **Redis**: بدون رمز عبور
- **API**: بدون احراز هویت اضافی
- **Frontend**: بدون تنظیمات ویژه

### تغییر تنظیمات
برای تغییر تنظیمات محیط:

1. **ویرایش docker-compose.yml**:
   ```yaml
   environment:
     DATABASE_URL: postgresql://new_user:new_pass@postgres:5432/new_db
     SECRET_KEY: your-new-secret-key
   ```

2. **استفاده از فایل .env**:
   ```bash
   cp .env.example .env
   # ویرایش فایل .env
   docker-compose up -d --build
   ```

## 🚀 استقرار در سرور

### برای محیط تولید (Production)

1. **ایجاد فایل تنظیمات محیط**:
   ```bash
   cp .env.example .env.production
   # ویرایش تنظیمات برای محیط تولید
   ```

2. **تنظیمات امنیتی**:
   - تغییر رمزهای پیش‌فرض
   - استفاده از SSL/TLS
   - محدودیت دسترسی به پورت‌ها

3. **اجرای سرویس‌ها**:
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```

### تنظیمات SSL (اختیاری)

1. **ایجاد گواهی SSL**:
   ```bash
   mkdir -p nginx/ssl
   # قرار دادن فایل‌های SSL در پوشه nginx/ssl
   ```

2. **فعال‌سازی SSL در docker-compose.yml**:
   ```yaml
   nginx:
     volumes:
       - ./nginx/ssl:/etc/nginx/ssl
   ```

## 🐛 عیب‌یابی

### مشکلات رایج

#### 1. پورت اشغال شده
```bash
# بررسی پورت‌های اشغال شده
sudo netstat -tlnp | grep :8000
sudo netstat -tlnp | grep :3000

# تغییر پورت در docker-compose.yml
ports:
  - "8001:8000"  # تغییر از 8000 به 8001
```

#### 2. مشکل در ساخت ایمیج
```bash
# پاکسازی کش Docker
docker system prune -a

# ساخت مجدد
docker-compose build --no-cache
```

#### 3. مشکل در اتصال به دیتابیس
```bash
# بررسی لاگ دیتابیس
docker-compose logs postgres

# تست اتصال به دیتابیس
docker-compose exec postgres psql -U webui_user -d webui_usermanagement
```

#### 4. مشکل در frontend
```bash
# بررسی لاگ frontend
docker-compose logs frontend

# ورود به کانتینر frontend
docker-compose exec frontend sh
```

### دستورات عیب‌یابی

```bash
# بررسی سلامتی کانتینرها
docker-compose ps

# بررسی لاگ‌ها
docker-compose logs --tail=100

# تست اتصال به API
curl http://localhost:8000/health

# تست اتصال به frontend
curl http://localhost:3000
```

## 💾 بک‌آپ و بازیابی

### بک‌آپ دیتابیس
```bash
# بک‌آپ گیری
docker-compose exec postgres pg_dump -U webui_user webui_usermanagement > backup.sql

# بازیابی
docker-compose exec -T postgres psql -U webui_user -d webui_usermanagement < backup.sql
```

### بک‌آپ کامل سیستم
```bash
# بک‌آپ حجم‌ها
docker run --rm -v postgres_data:/source -v $(pwd)/backup:/backup alpine tar czf /backup/postgres_backup.tar.gz -C /source .

# بازیابی
docker run --rm -v postgres_data:/target -v $(pwd)/backup:/backup alpine tar xzf /backup/postgres_backup.tar.gz -C /target
```

## 📈 نظارت و مانیتورینگ

### مشاهده مصرف منابع
```bash
# مشاهده مصرف منابع
docker stats

# مشاهده لاگ‌های زنده
docker-compose logs -f --tail=100
```

### هشدارها و مانیتورینگ
```bash
# بررسی سلامتی سرویس‌ها
docker-compose ps

# بررسی لاگ‌های خطا
docker-compose logs --grep ERROR
```

## 🎯 نکات مهم

1. **امنیت**: در محیط تولید حتماً رمزهای پیش‌فرض را تغییر دهید
2. **بک‌آپ**: به طور منظم بک‌آپ از دیتابیس تهیه کنید
3. **مانیتورینگ**: لاگ‌ها و وضعیت سرویس‌ها را به طور مداوم بررسی کنید
4. **به‌روزرسانی**: به طور منظم ایمیج‌ها و وابستگی‌ها را به‌روز کنید

## 🆘 پشتیبانی

برای مشکلات بیشتر:
- بررسی لاگ‌ها با `docker-compose logs -f`
- بررسی وضعیت سرویس‌ها با `docker-compose ps`
- مراجعه به مستندات Docker و Docker Compose