### 1. Backend Configuration (`/api-backend`)
```bash
cd api-backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed --class=DatabaseSeeder
php artisan serve
```
*Note: Ensure your `RAWG_API_KEY` is set in the `.env` file.*

### 2. Frontend Configuration (`/frontend`)
```bash
cd frontend
npm install
npm run dev
```
