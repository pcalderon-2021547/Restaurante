# Guía: Login migrado a React Native (client-user)

Este documento explica qué se migró, qué se tocó y cómo levantar todo
para probar el login en el emulador de Android Studio (Pixel 8).

## 1. Qué se migró

Origen: `FrontedRestaurante/RestauranteClient` (`AuthPage.jsx`,
`LoginForm.jsx`, `ForgotPasswordForm.jsx`, `index.css` — paleta
"obsidian & gold").

Destino: `KinalSportsIN6BM/client-user/src/features/auth/`.

**Importante sobre la lógica:** `client-user` ya tenía un módulo de login
funcional (`useAuth`, `authStore`, `authClient`) conectado al
`authentication-service` (.NET) y a `server-user`. Esa lógica **no se
reescribió** porque ya funcionaba correctamente; solo se le dio la
identidad visual del login original. Lo que se creó/modificó:

| Archivo | Acción |
|---|---|
| `src/shared/constants/theme.js` | Se agregaron `AUTH_COLORS` / `AUTH_FONTS` (paleta oro/obsidiana), sin tocar `COLORS` (usado por Fields/Profile). |
| `src/shared/components/auth/AuthInput.jsx` | **Nuevo.** Input con foco dorado, equivalente a `.auth-input`. |
| `src/shared/components/auth/AuthButton.jsx` | **Nuevo.** Botón con gradiente dorado (`expo-linear-gradient`), equivalente a `.auth-btn`. |
| `src/shared/components/auth/AuthHeader.jsx` | **Nuevo.** Encabezado con marca + línea dorada + tagline, versión de una sola columna del panel izquierdo de la web. |
| `src/features/auth/screens/LoginScreen.jsx` | Rediseñado con la nueva identidad visual. Lógica intacta (`useAuth().handleLogin`). |
| `src/features/auth/screens/RegisterScreen.jsx` | Rediseñado igual. También se corrigió un bug (`Alert.alert` con una coma faltante que rompía el botón "OK"). |
| `src/features/auth/screens/ForgotPasswordScreen.jsx` | **Nuevo.** No existía en móvil; el backend .NET ya expone `POST /forgot-password`. |
| `src/features/auth/hooks/useAuth.js` | Se agregó `handleForgotPassword`. `handleLogin`/`handleRegister` sin cambios. |
| `src/navigation/AuthStack.jsx` | Se agregó la ruta `ForgotPassword`. |
| `.env` | Actualizado para apuntar al emulador de Android (`10.0.2.2`) en vez de una IP de red local. |

No se tocó la arquitectura de microservicios: `server-user`,
`server-admin` y `authentication-service` siguen siendo servicios
independientes, cada uno con su propio proceso y base de datos.

## 2. Dependencia nueva

Se usa `expo-linear-gradient` para el botón dorado. Instálala con el
resolutor de versiones de Expo (evita romper compatibilidad con tu SDK):

```bash
cd KinalSportsIN6BM/client-user
npx expo install expo-linear-gradient
```

## 3. Variables de entorno (`client-user/.env`)

```env
EXPO_PUBLIC_AUTH_URL=http://10.0.2.2:5156/api/v1/auth
EXPO_PUBLIC_USER_URL=http://10.0.2.2:3003/kinalSportsUser/v1
```

`10.0.2.2` es la IP fija que el **emulador** de Android Studio usa para
llegar al `localhost` de tu máquina anfitriona. Si en algún momento
pruebas en un **celular físico** en la misma red WiFi, cambia
`10.0.2.2` por la IP local de tu PC (ej. `192.168.x.x`) en ambas
variables.

## 4. Orden de arranque

Ejecuta cada bloque en una terminal separada, en este orden:

### 4.1 Base de datos + auth-service (.NET)

```bash
cd KinalSportsIN6BM/authentication-service/auth-service
docker-compose up -d
dotnet run --project src/AuthService.Api
```

Verifica que responde: abre `http://localhost:5156/swagger` en tu
navegador (no en el emulador).

> Nota: el `docker-compose.yml` de este servicio mapea Postgres en
> `5433:5432`. Si tienes otro `docker-compose` a nivel raíz del
> proyecto con un mapeo distinto (`5435`), asegúrate de **solo levantar
> uno de los dos** para ese contenedor, o cambia el nombre del
> contenedor/puerto para que no choquen.

### 4.2 server-user (Node/Express)

```bash
cd KinalSportsIN6BM/server-user
pnpm install
pnpm run dev
```

Debe quedar escuchando en el puerto `3003` (definido en su `.env`).

### 4.3 App móvil (client-user)

```bash
cd KinalSportsIN6BM/client-user
pnpm install
npx expo install expo-linear-gradient
pnpm run android
```

Con el AVD "Pixel 8" ya abierto en Android Studio, Expo instalará y
abrirá la app automáticamente. La pantalla de Login debe cargar con el
fondo oscuro y los acentos dorados.

## 5. Prueba rápida

1. En el AVD, entra a **Crear cuenta** y registra un usuario de prueba.
2. Inicia sesión con ese usuario en **Login**.
3. Prueba **¿Olvidaste tu contraseña?** con un correo válido; debería
   mostrar el mensaje de confirmación (el envío real de correo depende
   de que `auth-service` tenga configurado su proveedor SMTP).

## 6. Problemas comunes

| Síntoma | Causa probable | Solución |
|---|---|---|
| `Network Error` al iniciar sesión | El emulador no puede alcanzar el backend | Confirma que usas `10.0.2.2` (no `localhost`) en `.env`, y que `auth-service`/`server-user` están corriendo. |
| El botón dorado no se ve (aparece blanco/gris) | Falta instalar `expo-linear-gradient` | `npx expo install expo-linear-gradient` y reinicia Metro (`pnpm run android` de nuevo). |
| Error de Postgres "port already in use" | Choque entre dos `docker-compose` (5433 vs 5435) | Detén el contenedor duplicado (`docker ps`, `docker stop <id>`) y deja solo uno. |
| 401 al hacer login con datos correctos | `auth-service` no está corriendo o el JWT_SECRET no coincide con `server-user` | Verifica que ambos `.env` usen el mismo `JWT_SECRET`/`JWT_ISSUER`/`JWT_AUDIENCE`. |
