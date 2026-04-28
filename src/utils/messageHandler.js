/**
 * Mapeo de mensajes de error técnicos a mensajes profesionales en español.
 * Evita mostrar datos sensibles y corrige ortografía.
 */
const ERROR_MESSAGES = {
    // Errores de Autenticación
    "INVALID_CREDENTIALS": "El correo electrónico o la contraseña son incorrectos.",
    "USER_NOT_FOUND": "No se encontró ninguna cuenta con este correo electrónico.",
    "EMAIL_ALREADY_EXISTS": "Este correo electrónico ya está registrado.",
    "TOKEN_EXPIRED": "Tu sesión ha expirado. Por favor, inicia sesión de nuevo.",
    "TOKEN_INVALID": "La sesión no es válida. Por favor, intenta de nuevo.",
    "UNAUTHORIZED": "No tienes permiso para realizar esta acción.",
    
    // Errores de Validación (General)
    "VALIDATION_ERROR": "Por favor, verifica los datos ingresados.",
    "MISSING_FIELDS": "Todos los campos son obligatorios.",
    "INVALID_EMAIL": "El formato del correo electrónico no es válido.",
    "PASSWORD_TOO_SHORT": "La contraseña debe tener al menos 8 caracteres.",
    
    // Errores de Servidor / Red
    "SERVER_ERROR": "Hubo un problema en nuestros servidores. Por favor, inténtalo más tarde.",
    "CONNECTION_ERROR": "No se pudo establecer conexión con el servidor. Verifica tu internet.",
    "FETCH_ERROR": "Error al obtener los datos. Por favor, recarga la página.",
    
    // Errores de Workspace / Canales
    "WORKSPACE_NOT_FOUND": "El espacio de trabajo solicitado no existe.",
    "CHANNEL_NOT_FOUND": "El canal solicitado no existe.",
    "MEMBER_NOT_FOUND": "El miembro solicitado no existe.",
    "ALREADY_MEMBER": "Ya eres miembro de este espacio de trabajo.",
    "NOT_A_MEMBER": "No eres miembro de este espacio de trabajo."
};

const SUCCESS_MESSAGES = {
    "LOGIN_SUCCESS": "Sesión iniciada correctamente. ¡Bienvenido!",
    "REGISTER_SUCCESS": "Cuenta creada con éxito. Ya puedes iniciar sesión.",
    "PASSWORD_RESET_REQUEST_SUCCESS": "Se ha enviado un correo para restablecer tu contraseña.",
    "PASSWORD_RESET_SUCCESS": "Contraseña actualizada correctamente.",
    "WORKSPACE_CREATED": "Espacio de trabajo creado con éxito.",
    "CHANNEL_CREATED": "Canal creado con éxito.",
    "MESSAGE_SENT": "Mensaje enviado.",
    "MEMBER_ADDED": "Miembro añadido correctamente."
};

/**
 * Procesa una respuesta o error y devuelve un mensaje amigable.
 * @param {Object} response - El objeto de respuesta de la API o el error.
 * @param {string} fallback - Mensaje por defecto si no se encuentra mapeo.
 * @returns {string}
 */
export const getFriendlyMessage = (response, fallback = "Ocurrió un error inesperado.") => {
    // Si no hay respuesta, devolvemos el fallback
    if (!response) return fallback;

    // Si es un error de conexión (cuando fetch falla antes de recibir respuesta)
    if (response instanceof Error || response.message === "Failed to fetch") {
        return ERROR_MESSAGES["CONNECTION_ERROR"];
    }

    // Buscamos un código de error o mensaje específico devuelto por el backend
    // El backend suele devolver { ok: false, message: "CODE", ... } o { ok: false, message: "Mensaje amigable" }
    const messageCode = response.message || response.code;

    // 1. Intentamos mapear si es un código técnico conocido
    if (ERROR_MESSAGES[messageCode]) {
        return ERROR_MESSAGES[messageCode];
    }

    if (SUCCESS_MESSAGES[messageCode]) {
        return SUCCESS_MESSAGES[messageCode];
    }

    // 2. Si no es un código conocido, pero hay un mensaje, lo mostramos tal cual (si no es sensible)
    if (typeof messageCode === 'string' && messageCode.length > 0) {
        // Filtro de seguridad robusto para no mostrar errores crudos de base de datos, código o trazas
        const sensitiveKeywords = [
            'sql', 'mongodb', 'database', 'undefined', 'null', 'at ', 'stack', 'mongoerror',
            'referenceerror', 'typeerror', 'syntaxerror', 'internal server error', 'bsonerror',
            'tokenerror', 'path ', 'node_modules', 'repository', 'controller', 'service'
        ];
        
        const isSensitive = sensitiveKeywords.some(key => messageCode.toLowerCase().includes(key));
        
        // También detectamos si el mensaje parece una ruta de archivo o una traza de stack
        const looksLikeStackTrace = messageCode.includes(':/') || messageCode.includes(':\\') || messageCode.split('\n').length > 1;

        if (!isSensitive && !looksLikeStackTrace) {
            return messageCode;
        }
    }

    return ERROR_MESSAGES["SERVER_ERROR"] || fallback;
};
