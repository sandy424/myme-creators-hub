export const MAX_ATTACHMENT_COUNT = 5;
export const MAX_ATTACHMENT_BYTES = 2 * 1024 * 1024;
const DATA_PREFIX = 'data:application/octet-stream;base64,';

export function validateAttachments(attachments = []) {
  if (!Array.isArray(attachments) || attachments.length > MAX_ATTACHMENT_COUNT) {
    throw new Error('첨부자료는 최대 5개까지 추가할 수 있습니다.');
  }
  let total = 0;
  const validated = attachments.map((file) => {
    if (
      !file ||
      typeof file.name !== 'string' ||
      !file.name.trim() ||
      file.name.length > 255 ||
      !Number.isSafeInteger(file.size) ||
      file.size < 0 ||
      typeof file.dataUrl !== 'string' ||
      !file.dataUrl.startsWith(DATA_PREFIX)
    ) {
      throw new Error('첨부자료를 다시 선택해 주세요.');
    }
    total += file.size;
    if (total > MAX_ATTACHMENT_BYTES) {
      throw new Error(
        '첨부자료의 전체 용량은 2MB 이하로 선택해 주세요. 큰 파일은 HTTPS 링크로 공유할 수 있어요.',
      );
    }
    const base64 = file.dataUrl.slice(DATA_PREFIX.length);
    const bytes =
      (base64.length / 4) * 3 - (base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0);
    if (base64.length % 4 !== 0 || !/^[A-Za-z0-9+/]*={0,2}$/.test(base64) || bytes !== file.size) {
      throw new Error('첨부자료를 읽을 수 없습니다. 파일을 다시 선택해 주세요.');
    }
    return { name: file.name, size: file.size, dataUrl: file.dataUrl };
  });
  return validated;
}

export async function readAttachments(files) {
  const list = Array.from(files);
  if (list.length > MAX_ATTACHMENT_COUNT)
    throw new Error('첨부자료는 최대 5개까지 추가할 수 있습니다.');
  if (list.reduce((sum, file) => sum + file.size, 0) > MAX_ATTACHMENT_BYTES) {
    throw new Error(
      '첨부자료의 전체 용량은 2MB 이하로 선택해 주세요. 큰 파일은 HTTPS 링크로 공유할 수 있어요.',
    );
  }
  const attachments = await Promise.all(
    list.map(async (file) => {
      const bytes = new Uint8Array(await file.arrayBuffer());
      let binary = '';
      for (let offset = 0; offset < bytes.length; offset += 32768) {
        binary += String.fromCharCode(...bytes.subarray(offset, offset + 32768));
      }
      return { name: file.name, size: file.size, dataUrl: DATA_PREFIX + btoa(binary) };
    }),
  );
  return validateAttachments(attachments);
}

export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
