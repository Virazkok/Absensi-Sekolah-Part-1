# 1️⃣ Build frontend
FROM node:18 AS node-builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build || echo "⚠️ Build skipped"

# 2️⃣ Laravel + Apache
FROM php:8.2-apache

# Install ekstensi PHP yang dibutuhkan
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    zip \
    git \
    unzip && \
    docker-php-ext-configure gd --with-freetype --with-jpeg && \
    docker-php-ext-install gd pdo pdo_mysql && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

RUN a2enmod rewrite
WORKDIR /var/www/html

# Copy semua file Laravel
COPY . .

# Copy hasil build dari Node
COPY --from=node-builder /app/public ./public

# Install Composer dan dependensi Laravel
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
RUN composer install --no-dev --optimize-autoloader

# Set permission dan cache konfigurasi
RUN chown -R www-data:www-data storage bootstrap/cache
RUN php artisan config:cache && php artisan route:cache && php artisan view:cache

EXPOSE 80
CMD ["apache2-foreground"]
