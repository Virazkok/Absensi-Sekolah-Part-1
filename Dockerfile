# ========================================
# 1️⃣ BUILD FRONTEND (React / Vite)
# ========================================
FROM node:18 AS node-builder
WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build || echo "⚠️ Build skipped"


# ========================================
# 2️⃣ BUILD BACKEND (Laravel + Apache)
# ========================================
FROM php:8.2-apache

# Install library system untuk GD dan ekstensi PHP penting
RUN apt-get update && apt-get install -y \
    libfreetype6-dev \
    libjpeg62-turbo-dev \
    libpng-dev \
    libzip-dev \
    zip \
    unzip \
    git && \
    docker-php-ext-configure gd --with-freetype --with-jpeg && \
    docker-php-ext-install gd pdo pdo_mysql zip && \
    a2enmod rewrite && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /var/www/html

# Copy file project Laravel
COPY . .

# Copy hasil build frontend (Vite/React)
COPY --from=node-builder /app/public ./public

# Install Composer dan dependensi Laravel
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# ✅ Jalankan composer install dan pastikan ekstensi GD sudah aktif
RUN php -m | grep gd || (echo "❌ GD tidak aktif!" && exit 1)
RUN composer install --no-dev --optimize-autoloader

# Set permission dan cache config
RUN chown -R www-data:www-data storage bootstrap/cache
RUN php artisan config:cache && php artisan route:cache && php artisan view:cache || true

EXPOSE 80
CMD ["apache2-foreground"]
