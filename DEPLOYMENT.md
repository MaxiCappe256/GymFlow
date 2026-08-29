# Guía de Despliegue a Producción — GymFlow v1.0

Esta guía detalla los pasos para poner GymFlow en producción utilizando cualquiera de los dos métodos estándar de la industria.

---

## Opción 1: Despliegue con Docker Compose (Recomendada para VPS / Servidor Propio)

GymFlow cuenta con una arquitectura de contenedor multi-etapa ultra-liviana basada en Next.js Standalone (`output: "standalone"`) y PostgreSQL 16.

### 1. Clonar el repositorio en el servidor
```bash
git clone <tu-repositorio> gymflow
cd gymflow
```

### 2. Configurar variables de entorno
Copiá el archivo de ejemplo y editá las contraseñas:
```bash
cp .env.example .env
```

Generá un secreto seguro para JWT:
```bash
openssl rand -base64 32
```
Pegá ese valor en `JWT_SECRET` y `NEXTAUTH_SECRET` dentro de tu `.env`.

### 3. Levantar la aplicación con Docker Compose
```bash
# Construir y levantar contenedores en segundo plano
docker compose up --build -d
```

### 4. Ejecutar migraciones y datos iniciales en el contenedor
```bash
# Sincronizar esquema de base de datos
docker compose exec app npx prisma db push

# Llenar la base con el catálogo de 27 ejercicios en español
docker compose exec app npm run db:seed
```

### 5. Monitoreo y Mantenimiento
```bash
# Ver logs en vivo
docker compose logs -f app

# Detener la aplicación
docker compose down
```

---

## Opción 2: Despliegue en la Nube (Vercel / Railway / Render + Base de Datos Gestionada)

Si preferís una infraestructura serverless / gestionada:

1. **Base de Datos**: Creá una instancia de PostgreSQL en [Neon](https://neon.tech), [Supabase](https://supabase.com) o [Railway](https://railway.app).
2. **Variables en tu plataforma de hosting (ej. Vercel Dashboard)**:
   - `DATABASE_URL`: La URL de conexión de tu base PostgreSQL en la nube.
   - `JWT_SECRET`: Tu clave aleatoria de 32+ caracteres.
   - `NEXTAUTH_SECRET`: Mismo valor que `JWT_SECRET`.
   - `NEXTAUTH_URL`: La URL pública de tu dominio (ej. `https://gymflow.app`).
3. **Build Command**: `npm run build`
4. **Ejecutar Seed inicial**:
   ```bash
   npx prisma db push
   npx tsx prisma/seed.ts
   ```

---

## Verificación Post-Despliegue

1. **PWA**: Abrí la aplicación desde tu teléfono móvil (Chrome o Safari) y verificá el botón "Instalar aplicación" o "Agregar a la pantalla de inicio". El icono de GymFlow se mostrará con el diseño oficial.
2. **Entrenamiento Offline**: Iniciá una sesión en `/workout/quick-start`, activá el Modo Avión en tu teléfono, completá varias series y comprobá que los datos persisten sin errores gracias a IndexedDB.
3. **Cuentas de prueba creadas**:
   - `beginner@gymflow.dev` (Pass: `123123`)
   - `intermediate@gymflow.dev` (Pass: `123123`)
   - `advanced@gymflow.dev` (Pass: `123123`)
