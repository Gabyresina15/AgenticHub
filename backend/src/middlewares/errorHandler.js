export const errorHandler = (err, req, res, next) => {
  console.error('🔥 [Error Global Capturado]:', err.stack);
  
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || 'Error interno del servidor.',
    status: statusCode
  });
};