import { useEffect, useRef, useId } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

/**
 * Composant de scanner QR/Barcode réutilisable
 * @param {function} onScan - Callback appelé avec le texte décodé
 * @param {function} onError - Callback optionnel d'erreur
 * @param {boolean} active - Active/désactive le scanner
 * @param {'qr'|'barcode'|'both'} mode - Type de code à scanner
 */
export default function QRScanner({ onScan, onError, active = true, mode = 'qr' }) {
  const scannerRef = useRef(null);
  const html5QrRef = useRef(null);
  const uniqueId = useId().replace(/:/g, '');
  const readerId = `qr-reader-${uniqueId}`;

  useEffect(() => {
    if (!active || !scannerRef.current) return;

    const scanner = new Html5Qrcode(readerId);
    html5QrRef.current = scanner;

    const isBarcode = mode === 'barcode';
    const qrbox = isBarcode ? { width: 300, height: 100 } : { width: 250, height: 250 };

    const formatsToSupport = mode === 'barcode'
      ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] // EAN, UPC, Code128, etc.
      : mode === 'both'
        ? undefined // all formats
        : undefined; // default (all)

    scanner.start(
      { facingMode: 'environment' },
      {
        fps: 10,
        qrbox,
        ...(formatsToSupport ? { formatsToSupport } : {}),
      },
      (decodedText) => {
        onScan(decodedText);
      },
      () => {}
    ).catch((err) => {
      onError?.(err.message || 'Impossible d\'accéder à la caméra');
    });

    return () => {
      scanner.stop().catch(() => {});
    };
  }, [active, mode]);

  return (
    <div className="relative">
      <div
        id={readerId}
        ref={scannerRef}
        className="w-full max-w-sm mx-auto rounded-lg overflow-hidden"
      />
      {!active && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
          <p className="text-white font-medium">Scanner en pause</p>
        </div>
      )}
    </div>
  );
}
