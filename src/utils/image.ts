/**
 * Утилита для клиентского сжатия изображений через HTML5 Canvas.
 * Уменьшает максимальное разрешение до 1024px по большей стороне
 * и сжимает в JPEG (качество 0.7).
 */
export async function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        const MAX_WIDTH = 1024;
        const MAX_HEIGHT = 1024;
        let width = img.width;
        let height = img.height;

        // Вычисляем новые размеры с сохранением пропорций
        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Не удалось получить 2D контекст canvas'));
          return;
        }

        // Отрисовываем сжатую картинку на canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Получаем data URL в формате JPEG с качеством 0.7
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);

        // Извлекаем чистую base64-строку (без префикса data:image/jpeg;base64,)
        const base64 = dataUrl.split(',')[1];
        resolve(base64);
      };
      
      img.onerror = (error) => reject(new Error('Ошибка при загрузке изображения в Image'));
    };
    
    reader.onerror = (error) => reject(new Error('Ошибка при чтении файла через FileReader'));
  });
}
