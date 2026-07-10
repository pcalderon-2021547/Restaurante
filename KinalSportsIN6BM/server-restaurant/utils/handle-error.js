export const handleError = (res, error, messages) => {

    if (error?.code === 11000) {
        return res.status(400).json({
            success: false,
            message: messages?.duplicateMessage || 'Registro duplicado'
        });
    }

    if (error?.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: messages?.validationMessage || 'Datos inválidos',
            error: error.message
        });
    }

    return res.status(500).json({
        success: false,
        message: messages?.defaultMessage || 'Error interno del servidor',
        error: error.message
    });
};