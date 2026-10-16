import { canvas2d } from './imageProcessing'
import type { SourceImage } from '../types/editor'
export async function createDemo(): Promise<SourceImage> {
  const { canvas, ctx } = canvas2d(1000, 760)
  ctx.fillStyle = '#f4f6f7'; ctx.fillRect(0, 0, 1000, 760)
  ctx.fillStyle = '#ffffff'; ctx.fillRect(120, 65, 760, 630)
  ctx.fillStyle = '#075b45'; ctx.fillRect(120, 65, 760, 115)
  ctx.font = 'bold 29px sans-serif'; ctx.fillStyle = '#fff'; ctx.fillText('Transaction receipt', 165, 134)
  ctx.fillStyle = '#e5f4eb'; ctx.beginPath(); ctx.arc(500, 259, 35, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#168b60'; ctx.font = 'bold 35px sans-serif'; ctx.fillText('✓', 486, 272)
  ctx.fillStyle = '#183e32'; ctx.font = 'bold 26px sans-serif'; ctx.fillText('Payment successful', 363, 329)
  ctx.fillStyle = '#6a7772'; ctx.font = '19px sans-serif'; ctx.fillText('October 16, 2026 · 10:42 AM', 359, 364)
  const rows = [['Amount', '৳ 2,500.00'], ['Recipient', 'Alex Morgan'], ['Phone number', '+880 1712 345678'], ['Transaction ID', 'MM8A2F930X']]
  rows.forEach(([label, value], i) => { const y = 431 + i * 57; ctx.font = '20px sans-serif'; ctx.fillStyle = '#718078'; ctx.fillText(label, 169, y); ctx.fillStyle = '#233b30'; ctx.font = i === 0 ? 'bold 25px sans-serif' : '21px sans-serif'; ctx.fillText(value, 559, y) })
  ctx.fillStyle = '#a4afa9'; ctx.font = '15px sans-serif'; ctx.fillText('ILLUSTRATIVE SAMPLE · FICTIONAL DETAILS', 321, 667)
  const image = await createImageBitmap(canvas); canvas.width = canvas.height = 0
  return { image, name: 'sample-receipt.png', width: 1000, height: 760, demo: true }
}
