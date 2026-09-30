import { IMAGE_LIMITS, validateImageDimensions, validateImageFile } from './utils/imageValidation';

const MAX_SOURCE_BYTES = IMAGE_LIMITS.maxBytes;
const OUTPUT_SIZE = 160;

/** Lee una imagen, valida tipo/peso/dimensiones, la recorta a un cuadrado centrado y la reduce a un data URI liviano. */
export function resizeImageToDataUri(file) {
  return new Promise((resolve, reject) => {
    const fileError = validateImageFile(file);
    if (fileError) {
      reject(new Error(fileError));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('El archivo no es una imagen válida.'));
      img.onload = async () => {
        const dimensionError = await validateImageDimensions(file);
        if (dimensionError) {
          reject(new Error(dimensionError));
          return;
        }
        const canvas = document.createElement('canvas');
        canvas.width = OUTPUT_SIZE;
        canvas.height = OUTPUT_SIZE;
        const ctx = canvas.getContext('2d');
        const side = Math.min(img.width, img.height);
        const sx = (img.width - side) / 2;
        const sy = (img.height - side) / 2;
        ctx.drawImage(img, sx, sy, side, side, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
