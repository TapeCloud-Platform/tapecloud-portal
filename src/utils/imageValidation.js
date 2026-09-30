/**
 * Validación de imágenes subidas (tipo, peso y dimensiones) antes de enviarlas.
 * Complementa la validación del backend (AvatarValidationService): si el archivo
 * no cumple acá, se avisa sin gastar la subida.
 */
export const IMAGE_LIMITS = {
  maxBytes: 5 * 1024 * 1024,
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  minDimension: 32,
  maxDimension: 4096,
};

/** Chequeos sincrónicos (tipo y peso). Devuelve mensaje de error o null. */
export function validateImageFile(file, limits = IMAGE_LIMITS) {
  if (!file) {
    return 'No se eligió ningún archivo.';
  }
  if (!limits.allowedTypes.includes(file.type)) {
    return 'Tipo de imagen no permitido. Usá JPEG, PNG, WEBP o GIF.';
  }
  if (file.size > limits.maxBytes) {
    return `La imagen no puede pesar más de ${Math.round(limits.maxBytes / 1024 / 1024)} MB.`;
  }
  return null;
}

/** Chequeo asíncrono de dimensiones. Devuelve mensaje de error o null. */
export function validateImageDimensions(file, limits = IMAGE_LIMITS) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve('El archivo no es una imagen válida.');
    };
    img.onload = () => {
      URL.revokeObjectURL(url);
      if (img.width < limits.minDimension || img.height < limits.minDimension) {
        resolve(`La imagen es demasiado chica (mínimo ${limits.minDimension}x${limits.minDimension} px).`);
        return;
      }
      if (img.width > limits.maxDimension || img.height > limits.maxDimension) {
        resolve(`La imagen es demasiado grande (máximo ${limits.maxDimension}x${limits.maxDimension} px).`);
        return;
      }
      resolve(null);
    };
    img.src = url;
  });
}
