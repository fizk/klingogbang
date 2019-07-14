FROM php:7.3-apache

RUN apt-get update \
 && apt-get install -y zip libzip-dev \
 && apt-get install -y libmagickwand-dev libmagickcore-dev \
 && apt-get install -y zip unzip \
 && apt-get install -y imagemagick \
 && apt-get install -y git zlib1g-dev vim \
 && apt-get install -y autoconf g++ make openssl libssl-dev libcurl4-openssl-dev pkg-config libsasl2-dev libpcre3-dev \
 && docker-php-ext-install zip \
 && docker-php-ext-install pdo_mysql \
 && docker-php-ext-install bcmath \
 && docker-php-ext-install sockets \
 && a2enmod rewrite \
 && sed -i 's!/var/www/html!/var/www/public!g' /etc/apache2/apache2.conf \
 && sed -i 's!/var/www/html!/var/www/public!g' /etc/apache2/sites-available/000-default.conf \
 && mv /var/www/html /var/www/public \
 && curl -sS https://getcomposer.org/installer \
  | php -- --install-dir=/usr/local/bin --filename=composer

RUN pecl install -o -f imagick-3.4.4 \
    && rm -rf /tmp/pear \
    && docker-php-ext-enable imagick


EXPOSE 80

WORKDIR /var/www
