# 1️⃣ Build frontend (Vite)
FROM node:18 AS node-builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 2️⃣ Laravel + Apache
FROM php:8.2-apache

# Install ekstensi dasar yang diperlukan Laravel
RUN docker-php-ext-install pdo pdo_mysql

# Aktifkan mod_rewrite Apache untuk routing Laravel
RUN a2enmod rewrite

# Set working directory
WORKDIR /var/www/html

# Copy semua file Laravel
COPY . .

# Copy hasil build frontend
COPY --from=node-builder /app/public/build ./public/build

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Install dependensi Laravel
RUN composer install --no-dev --optimize-autoloader

# Set permission storage
RUN chown -R www-data:www-data storage bootstrap/cache

# Cache konfigurasi
RUN php artisan config:cache && php artisan route:cache && php artisan view:cache

# Expose port 80
EXPOSE 80

# Jalankan Apache
CMD ["apache2-foreground"]
