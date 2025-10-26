# ==========================
# 1️⃣ Build aset frontend
# ==========================
FROM node:18 AS node-builder
WORKDIR /app

# Copy package.json dan package-lock.json
COPY package*.json ./
RUN npm install

# Copy seluruh kode proyek
COPY . .

# Build aset frontend (Vite)
RUN npm run build


# ==========================
# 2️⃣ Build backend Laravel
# ==========================
FROM php:8.2-apache

# Install dependensi sistem
RUN apt-get update && apt-get install -y \
    libfreetype6-dev \
    libjpeg62-turbo-dev \
    libpng-dev \
    libzip-dev \
    zip unzip git curl \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install gd pdo pdo_mysql zip exif \
    && a2enmod rewrite

# Set working directory
WORKDIR /var/www/html

# Copy seluruh kode ke container
COPY . .

# Copy hasil build dari tahap node
COPY --from=node-builder /app/public/build ./public/build

# Install composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Install dependencies Laravel
RUN composer install --no-dev --optimize-autoloader

# Set permission untuk Laravel storage
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Cache konfigurasi Laravel
RUN php artisan config:cache && php artisan route:cache && php artisan view:cache

# Expose port 80
EXPOSE 80

# Jalankan Laravel menggunakan Apache (bukan php artisan serve)
CMD ["apache2-foreground"]
