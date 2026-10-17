import type { FileExport } from './types';

export const webFileExport: FileExport = {
  async exportText(filename, text) {
    try {
      const file = new File([text], filename, { type: 'text/plain' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: filename });
        return 'shared';
      }
    } catch (e) {
      if ((e as Error)?.name === 'AbortError') return 'failed';
    }
    try {
      await navigator.clipboard.writeText(text);
      return 'copied';
    } catch {
      /* fall through */
    }
    try {
      const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
      const a = Object.assign(document.createElement('a'), { href: url, download: filename });
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      return 'downloaded';
    } catch {
      return 'failed';
    }
  },
};
