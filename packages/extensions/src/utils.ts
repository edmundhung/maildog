export async function copyText(text: string): Promise<void> {
  if (document.queryCommandSupported?.('copy')) {
    let hasError = false;
    const textarea = document.createElement('textarea');
    textarea.textContent = text;
    textarea.style.position = 'fixed';
    document.body.appendChild(textarea);
    textarea.select();

    try {
      // Security exception may be thrown by some browsers.
      document.execCommand('copy');
    } catch (error) {
      hasError = true;
      console.log(
        '[Error] Failed to copy text with the execCommand API',
        error,
      );
    } finally {
      document.body.removeChild(textarea);
    }

    if (!hasError) {
      return;
    }
  }

  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    console.log('[Error] Failed to copy text with the Clipboard API', error);
  }
}
