import { useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { useTranslation } from 'react-i18next'
import { Download, Share2, Zap } from 'lucide-react'
import toast from 'react-hot-toast'

export default function QRCodeCard({ url, businessName }) {
  const { t } = useTranslation()
  const qrRef = useRef()

  const downloadQR = () => {
    const svg = qrRef.current?.querySelector('svg')
    if (!svg) return

    const canvas = document.createElement('canvas')
    const size = 400
    canvas.width = size
    canvas.height = size + 60
    const ctx = canvas.getContext('2d')

    // Background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw SVG onto canvas
    const svgData = new XMLSerializer().serializeToString(svg)
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const svgUrl = URL.createObjectURL(svgBlob)
    const img = new Image()

    img.onload = () => {
      ctx.drawImage(img, 0, 0, size, size)

      // Business name text
      ctx.fillStyle = '#1e293b'
      ctx.font = 'bold 18px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(businessName || 'ReviewBoost', size / 2, size + 35)

      ctx.fillStyle = '#64748b'
      ctx.font = '13px Inter, sans-serif'
      ctx.fillText('Scan to leave a review ⭐', size / 2, size + 55)

      const link = document.createElement('a')
      link.download = `${businessName || 'reviewboost'}-qr.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      URL.revokeObjectURL(svgUrl)
      toast.success('QR Code downloaded!')
    }
    img.src = svgUrl
  }

  const shareQR = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Review us!', text: `Leave a review for ${businessName}`, url })
        toast.success('Shared!')
      } catch {
        // cancelled
      }
    } else {
      await navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard!')
    }
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500/20 to-accent-500/20 flex items-center justify-center">
          <Zap className="w-5 h-5 text-brand-500" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">{t('yourQRCode')}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">{t('qrInstructions')}</p>
        </div>
      </div>

      {/* QR Code */}
      <div ref={qrRef} className="flex justify-center mb-5">
        <div className="p-4 bg-white rounded-2xl shadow-glow-blue border border-brand-100">
          <QRCodeSVG
            value={url}
            size={200}
            bgColor="#ffffff"
            fgColor="#0369a1"
            level="H"
            includeMargin={false}
            imageSettings={{
              src: '',
              excavate: false,
            }}
          />
        </div>
      </div>

      {/* URL */}
      <div className="mb-5 p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Review Link</p>
        <p className="text-sm text-brand-600 dark:text-brand-400 font-mono break-all">{url}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={downloadQR} className="btn-secondary flex-1 !py-2.5 text-sm gap-2">
          <Download className="w-4 h-4" />
          {t('downloadQR')}
        </button>
        <button onClick={shareQR} className="btn-primary flex-1 !py-2.5 text-sm gap-2">
          <Share2 className="w-4 h-4" />
          {t('shareQR')}
        </button>
      </div>
    </div>
  )
}
