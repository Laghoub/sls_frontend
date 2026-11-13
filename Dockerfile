# Étape 1 : compilation Angular
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build -- --configuration production

# Étape 2 : serveur Nginx
FROM nginx:stable-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist/gestion-scolaire-web/browser /usr/share/nginx/html

EXPOSE 80
