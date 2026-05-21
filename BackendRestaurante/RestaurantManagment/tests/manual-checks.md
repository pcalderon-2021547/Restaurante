Manual checks para funcionalidades de perfil y Cloudinary

- Registro sin foto: POST /restaurantManagement/v1/auth/register sin profilePicture -> debe devolver avatar por defecto en user.profilePicture
- Registro con foto: POST /restaurantManagement/v1/auth/register con form-data campo profilePicture -> debe subir a Cloudinary y devolver user.profilePicture con URL completa
- Update con nueva foto: PUT /restaurantManagement/v1/auth/profile (token) con profilePicture -> debe subir nueva, borrar la anterior en Cloudinary y devolver nueva URL
- Update con removePhoto=true: PUT /.../profile con removePhoto=1 -> debe borrar foto en Cloudinary y establecer avatar por defecto

Para ejecutar los checks automáticos crear (y ejecutar) `tests/checkProfile.js` mientras el servidor está corriendo.
