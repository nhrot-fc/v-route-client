# V-Route Client

Cliente web para la plataforma de gestión de distribución de GLP.

## Configuración de Entorno

El proyecto incluye configuración para múltiples entornos:

- Desarrollo local: usando `.env` (API en `localhost:8080`)
- Producción con nginx: usando `.env.production` (API redirigida a través de `/api`)

Para más detalles, consulta [ENV-CONFIG.md](ENV-CONFIG.md).

## Iconografía

El proyecto incluye un conjunto de iconos SVG personalizados ubicados en `public/icons/`:

### Logos
- `glp-icon.svg` - Icono minimalista con gradiente azul y llama naranja
- `glp-logo.svg` - Logo completo con texto "V-ROUTE" y cilindro de gas

### Vehículos
- `truck-east.svg` - Camión mirando hacia el este
- `truck-west.svg` - Camión mirando hacia el oeste
- `truck-north.svg` - Camión mirando hacia el norte
- `truck-south.svg` - Camión mirando hacia el sur

### Ubicaciones
- `warehouse.svg` - Almacén secundario
- `main-warehouse.svg` - Almacén principal
- `customer.svg` - Cliente

### Objetos
- `package.svg` - Paquete o pedido
- `blocked-road.svg` - Ruta bloqueada

## Características de los iconos
- Diseño minimalista y moderno
- Uso de gradientes para dar profundidad
- Paleta de colores consistente
- Optimizados para diferentes tamaños
- Compatible con temas claros y oscuros

Para visualizar todos los iconos, abrir `public/icon-test.html` en un navegador.

## Desarrollo

### Instalación

```bash
npm install
# o
yarn install
# o
pnpm install
```

### Iniciar servidor de desarrollo

```bash
npm run dev
# o
yarn dev
# o
pnpm dev
```

Abrir [http://localhost:3000](http://localhost:3000) en el navegador.