export const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint no encontrado: ${req.method} ${req.originalUrl}`,
  });
};

export const errorHandler = (error, req, res, next) => {
  if (res.headersSent) return next(error);

  const statusCode = error.statusCode || (error.name === 'ValidationError' ? 400 : 500);
  const response = {
    success: false,
    message: error.message || 'Error interno del servidor',
  };

  if (error.code === 11000) {
    response.message = 'El registro ya existe';
  }

  res.status(statusCode).json(response);
};
