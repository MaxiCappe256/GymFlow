# Credenciales de Prueba & Cuentas Mock

Este documento contiene las cuentas de prueba y datos de prueba generados por [`prisma/seed.ts`](file:///C:/Users/maxil/Documents/Proyectos/gymflow/prisma/seed.ts) para desarrollo y testing local.

## Contraseña Global
La contraseña para todas las cuentas es:
```text
Gymflow123!
```

---

## Cuentas de Prueba

### 1. Cuenta Principiante
- **Rol / Nivel:** `BEGINNER`
- **Email:** `beginner@gymflow.dev`
- **Contraseña:** `Gymflow123!`
- **Nombre:** Lucas Principiante
- **Perfil:** Objetivo: `HYPERTROPHY`, 3 días/semana, 72 kg, 175 cm
- **Rutina Asignada:** `Full Body Starter (3 Días)` (Metodología: `FULL_BODY`)
- **Datos de prueba:**
  - 1 sesión de entrenamiento completada (`Día A - Empuje & Tren Inferior`)
  - 1 Récord Personal (Press de Banca: 40 kg, 1RM: 50 kg)

---

### 2. Cuenta Intermedia
- **Rol / Nivel:** `INTERMEDIATE`
- **Email:** `intermediate@gymflow.dev`
- **Contraseña:** `Gymflow123!`
- **Nombre:** Marcos Intermedio
- **Perfil:** Objetivo: `HYPERTROPHY`, 4 días/semana, 80 kg, 180 cm
- **Rutina Asignada:** `Torso / Pierna Frecuencia 2 (4 Días)` (Metodología: `UPPER_LOWER`)
- **Datos de prueba:**
  - 1 sesión de entrenamiento completada (`Torso - Fuerza / Hipertrofia`)
  - 2 Récords Personales (Press de Banca: 85 kg, Sentadilla Trasera: 120 kg)

---

### 3. Cuenta Avanzada / Pro
- **Rol / Nivel:** `ADVANCED`
- **Email:** `advanced@gymflow.dev`
- **Contraseña:** `Gymflow123!`
- **Nombre:** Valeria Avanzada
- **Perfil:** Objetivo: `STRENGTH`, 6 días/semana, 68 kg, 168 cm
- **Rutina Asignada:** `Push Pull Legs Pro (6 Días)` (Metodología: `PUSH_PULL_LEGS`)
- **Datos de prueba:**
  - 1 sesión pesada completada con series de aproximación (`Empuje A - Banca Pesada & Pecho`)
  - 3 Récords Personales (Press de Banca: 115 kg, Sentadilla Trasera: 155 kg, Peso Muerto Rumano: 160 kg)

---

## Cómo volver a ejecutar el Seed
Para reiniciar y volver a aplicar estas cuentas de prueba y el catálogo estándar de ejercicios en español, ejecutá:
```bash
npx prisma db seed
```
