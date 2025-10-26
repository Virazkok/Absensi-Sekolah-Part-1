# Gunakan base image PHP 8.2 dengan Apache
FROM php:8.2-apache

# Install dependensi sistem yang dibutuhkan GD, ZIP, dsb
RUN apt-get update && apt-get install -y \
    libfreetype6-dev \
    libjpeg62-turbo-dev \
    libpng-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install gd pdo pdo_mysql zip exif

# Set working directory
WORKDIR /var/www/html

# Copy semua file ke container
COPY . .

# Install Composer (pastikan composer.lock ada)
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Install dependensi PHP Laravel
RUN composer install --optimize-autoloader --no-dev

# Jalankan Laravel saat container start
CMD php artisan key:generate && php artisan serve --host=0.0.0.0 --port=80


# Expose port 80 untuk Railway
EXPOSE 80

# Command default (jalankan Laravel)
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=80"]
