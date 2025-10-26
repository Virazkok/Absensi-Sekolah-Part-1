# 1️⃣ Build frontend
FROM node:18 AS node-builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build || echo "⚠️ Build skipped"

# 2️⃣ Laravel + Apache
FROM php:8.2-apache
RUN docker-php-ext-install pdo pdo_mysql
RUN a2enmod rewrite
WORKDIR /var/www/html

COPY . .
# Copy hasil build jika ada
COPY --from=node-builder /app/public ./public

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
RUN composer install --no-dev --optimize-autoloader
RUN chown -R www-data:www-data storage bootstrap/cache
RUN php artisan config:cache && php artisan route:cache && php artisan view:cache

EXPOSE 80
CMD ["apache2-foreground"]
