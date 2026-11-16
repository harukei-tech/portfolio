# ローカル開発用イメージ（Lambda の php-84 ランタイムとバージョンを揃える）
FROM php:8.4-cli
RUN apt-get update && apt-get install -y --no-install-recommends unzip git && rm -rf /var/lib/apt/lists/*
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
WORKDIR /app
