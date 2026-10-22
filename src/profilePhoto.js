export const MAX_PROFILE_PHOTO_BYTES = 10 * 1024 * 1024;
export const PROFILE_PHOTO_ACCEPT = 'image/png,image/jpeg,image/webp';

export async function prepareProfilePhoto(file) {
  const supportedType = ['image/png', 'image/jpeg', 'image/webp'].includes(file.type);
  const supportedUntypedFile = !file.type && /\.(jpe?g|png|webp)$/i.test(file.name);
  if (!supportedType && !supportedUntypedFile) {
    throw new Error('JPG·PNG·WEBP 형식의 사진을 선택해 주세요.');
  }
  if (file.size > MAX_PROFILE_PHOTO_BYTES) {
    throw new Error('10MB 이하의 사진을 선택해 주세요.');
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    // Image loading also works in browsers without createImageBitmap support.
    const image = new Image();
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = () =>
        reject(new Error('사진을 읽을 수 없습니다. 다른 사진을 선택해 주세요.'));
      image.src = objectUrl;
    });
    if (!image.naturalWidth || !image.naturalHeight) {
      throw new Error('사진을 읽을 수 없습니다. 다른 사진을 선택해 주세요.');
    }
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('사진을 처리하지 못했습니다. 다시 선택해 주세요.');
    const side = Math.min(image.naturalWidth, image.naturalHeight);
    context.drawImage(
      image,
      (image.naturalWidth - side) / 2,
      (image.naturalHeight - side) / 2,
      side,
      side,
      0,
      0,
      256,
      256,
    );
    return canvas.toDataURL('image/png');
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
