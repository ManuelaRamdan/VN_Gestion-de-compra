# Etapa 1: Construcción (Build)
FROM node:20-alpine AS build
WORKDIR /app

ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Copiar los archivos de configuración de paquetes
COPY package.json package-lock.json* ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Construir el proyecto para producción (genera la carpeta 'dist')
RUN npm run build

# Etapa 2: Producción con Nginx
FROM nginx:alpine

# Copiar los archivos estáticos generados por Vite a la carpeta de Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# (Opcional) Si usas React Router, Nginx necesita una configuración extra para no dar error 404 al recargar
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer el puerto del servidor web
EXPOSE 80

# Iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
