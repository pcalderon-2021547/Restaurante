# GUÍA DE EJECUCIÓN — App Móvil (client-user)

## 1. Requisitos previos

- Node.js 18+
- pnpm (`npm install -g pnpm`)
- PostgreSQL corriendo en puerto **5433**
- MongoDB corriendo en puerto **27017**
- Expo Go en tu teléfono (o un emulador)

## 2. Iniciar base de datos PostgreSQL

Asegurate de tener PostgreSQL con estos datos (los usa el backend):

| Campo    | Valor             |
| -------- | ----------------- |
| Puerto   | `5433`            |
| Database | `KinalSports`     |
| Usuario  | `root`            |
| Password | `admin`           |

El backend crea la base de datos automáticamente si no existe.

## 3. Iniciar backend (server-restaurant)

Este es el **único backend que necesita la app móvil**. NO ejecutes el C# auth service (`authentication-service`).

```bash
cd C:\Restaurante\KinalSportsIN6BM\server-restaurant
pnpm install
node configs/app.js
```

El servidor se levanta en `http://localhost:3010`.

Al iniciar:
- Se conecta a PostgreSQL y MongoDB
- Crea la tabla `Users` automáticamente (via `sequelize.sync`)
- Carga las credenciales de email desde el archivo `.env`

## 4. Verificar que el backend funciona

```bash
curl http://localhost:3010/restaurantManagement/v1/Health
```

Respuesta esperada:

```json
{
  "status": "Healthy",
  "timestamp": "2026-07-09T23:25:40.841Z",
  "service": "Restaurant Management Server"
}
```

## 5. Iniciar app móvil (client-user)

```bash
cd C:\Restaurante\KinalSportsIN6BM\client-user
pnpm install
npx expo start
```

Esto abre el panel de Expo. Escaneá el QR con **Expo Go** en tu teléfono.

**Importante:** La app móvil está configurada para conectar al backend en `http://10.0.2.2:3010` (esto es `localhost` del emulador Android). Si usás un teléfono físico, cambiá la IP en `src/shared/constants/endpoints.js` a la IP local de tu PC.

## 6. Registro de usuario

Desde la app móvil:
1. Tocá **"Crear cuenta"**
2. Completá nombre, apellido, usuario, teléfono, email y contraseña
3. Presioná **"Crear cuenta"**

Si todo funciona:
- El backend crea el usuario en PostgreSQL
- Envía un correo de verificación desde `diegocoyote81@gmail.com` al email que registraste
- La app muestra: *"Revisa tu correo para verificarla"*

## 7. Configuración de email

Archivo: `KinalSportsIN6BM\server-restaurant\.env`

```
EMAIL_USER=diegocoyote81@gmail.com
EMAIL_PASS=zcgw nzxj abxo wjir
```

El correo se envía usando SMTP de Gmail con App Password. Si querés cambiarlo:
1. Usá un correo Gmail
2. Activá "Verificación en dos pasos" en tu cuenta Google
3. Generá un App Password en https://myaccount.google.com/apppasswords
4. Reemplazá `EMAIL_USER` y `EMAIL_PASS`
5. **Reiniciá** el backend (`server-restaurant`) para que tome los cambios

## 8. Solución de problemas comunes

### "relation users does not exist"

El backend no pudo crear la tabla `Users`.

**Solución:** Detené el servidor (Ctrl+C) y ejecutalo de nuevo:
```bash
node configs/app.js
```

### Error 500 al registrarse (ValidationError)

El modelo `User` no tiene algún campo que el controlador intenta guardar.

**Solución:** Revisá `src/fields/user/user.js` y el controlador `src/fields/auth/auth.controller.js` para que coincidan los campos.

### Error de conexión a PostgreSQL

**Solución:** Verificá que PostgreSQL esté corriendo en puerto 5433:
```bash
netstat -ano | findstr ":5433"
```

### El correo de verificación no llega

1. Revisá la carpeta Spam
2. Verificá las credenciales en `server-restaurant\.env`
3. Reiniciá el backend después de cambiar el `.env`
4. Si usaste un correo que no existe, el envío falla silenciosamente

### La app no conecta al backend desde el teléfono

**Solución:** Editá `src/shared/constants/endpoints.js`:
```js
export const ENDPOINTS = {
    API: "http://<TU_IP_LOCAL>:3010/restaurantManagement/v1",
    AUTH: "http://<TU_IP_LOCAL>:3010/restaurantManagement/v1/auth",
}
```

Reemplazá `<TU_IP_LOCAL>` con la IP de tu PC en la red local (ej: `192.168.1.10`).

### NO ejecutar el C# auth service

La app móvil (`client-user`) se comunica **únicamente** con el Node.js `server-restaurant` (puerto 3010). El C# `authentication-service` (puerto 5199) solo lo usan los frontends web (`FrontedRestaurante` y `client-admin`). Si lo ejecutás por error, no interfiere, pero tampoco es necesario.

## 9. Orden de arranque recomendado

```
1. PostgreSQL (servicio de Windows o Docker)
2. server-restaurant (node configs/app.js)
3. client-user (npx expo start)
4. Probar registro desde la app móvil
```

Sin el paso 2, la app móvil no funciona.
