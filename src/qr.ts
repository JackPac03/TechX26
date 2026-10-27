import { useEffect, useState } from 'react'
import type { EncodeHintType } from '@zxing/library'

// A QR code for a link, as rows of dark (true) and light modules, or null while zxing loads.
export const useQrRows = (url: string) => {
  const [qr, setQr] = useState<{ url: string; rows: boolean[][] } | null>(null)
  useEffect(() => {
    let current = true
    import('@zxing/library').then(({ BarcodeFormat, EncodeHintType, QRCodeWriter }) => {
      const hints = new Map<EncodeHintType, unknown>([[EncodeHintType.MARGIN, 0], [EncodeHintType.ERROR_CORRECTION, 'M']])
      const bits = new QRCodeWriter().encode(url, BarcodeFormat.QR_CODE, 0, 0, hints)
      const rows = Array.from({ length: bits.getHeight() }, (_, y) => Array.from({ length: bits.getWidth() }, (_, x) => bits.get(x, y)))
      if (current) setQr({ url, rows })
    })
    return () => { current = false }
  }, [url])
  return qr?.url === url ? qr.rows : null
}
