# Configuración de Entorno para V-Route Client

Este documento explica la configuración de entorno para la aplicación V-Route Client.

## Archivos de Configuración

El proyecto usa los siguientes archivos de configuración:

- `.env` - Configuración para desarrollo local
- `.env.production` - Configuración para entorno de producción (usado automáticamente durante la compilación de producción)
- `.env.example` - Ejemplo de configuración (para referencia)

## Variables de Entorno

### `VITE_NODE_ENV`
- Indica el entorno actual: `development` o `production`

### `VITE_API_BASE_URL`
- URL base para las peticiones API
- En desarrollo: `http://localhost:8080`
- En producción: `/api` (nginx redirigirá esta ruta al backend)

### `VITE_WS_URL`
- URL para conexiones WebSocket
- En desarrollo: `ws://localhost:8080/ws`
- En producción: `/api/ws` (se convertirá dinámicamente a `ws://[host]/api/ws`)

## Configuración de Nginx para Producción

En producción, nginx debe configurarse para redirigir las peticiones de la siguiente manera:

```nginx
server {
    listen 80;
    server_name tu-dominio.com;
    
    # Servir archivos estáticos de la aplicación frontend
    location / {
        root /ruta/a/tu/aplicacion;
        try_files $uri $uri/ /index.html;
    }
    
    # Redirigir peticiones API al backend
    location /api {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Opcional: quitar prefijo /api al redirigir
        # rewrite ^/api/?(.*) /$1 break;
    }
    
    # Configuración específica para WebSockets
    location /api/ws {
        proxy_pass http://localhost:8080/ws;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
}
```

## Compilación

- Para desarrollo: `npm run dev` (usa `.env`)
- Para producción: `npm run build` (usa `.env.production`)
