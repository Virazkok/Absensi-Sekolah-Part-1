# ========================================
# 1️⃣ BUILD FRONTEND (Vite)
# ========================================
FROM node:18 AS node-builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy semua file dan build frontend
COPY . .
RUN npm run build


# ========================================
# 2️⃣ BUILD BACKEND (Laravel + Apache)
# ========================================
FROM php:8.2-apache

# Install extensions yang diperlukan
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

WORKDIR /var/www/html

# Copy semua file Laravel
COPY . .

# ✅ Copy hasil build frontend dari tahap Node ke Laravel
COPY --from=node-builder /app/public/build ./public/build

# Install Composer dan dependensi Laravel
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
RUN composer install --no-dev --optimize-autoloader

# Permissions
RUN chown -R www-data:www-data storage bootstrap/cache

# Jalankan Laravel dan Apache saat container start
CMD php artisan config:clear && \
    php artisan cache:clear && \
    php artisan view:clear && \
    php artisan route:clear && \
    php artisan config:cache && \
    php artisan migrate --force && \
    apache2-foreground

EXPOSE 80
