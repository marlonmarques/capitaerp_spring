# frontend/Dockerfile
FROM node:18-alpine AS build

WORKDIR /app

# Copiar
COPY package*.json ./
RUN npm ci

# Copiar
COPY . .
RUN npm run build -- --configuration=production

FROM nginx:alpine

COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
