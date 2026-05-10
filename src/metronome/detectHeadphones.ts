/**
 * Best-effort detection of whether a headphone-class output is currently the default.
 *
 * Browsers do NOT expose this directly. `navigator.mediaDevices.enumerateDevices()`
 * returns labels only after the user has granted some media permission (mic).
 * If labels are absent, we cannot determine; return 'unknown'.
 *
 * Strategy:
 *   - Look at audiooutput devices' labels.
 *   - Match common headphone keywords (en/ko, common bluetooth product names).
 *   - If any audiooutput device is connected with a headphone-like label, return true.
 *
 * This is intentionally generous — false positives are tolerable since the user can
 * turn the toggle off; false negatives just leave the default OFF.
 */

const KEYWORDS = [
  'headphone',
  'headphones',
  'headset',
  'earphone',
  'earbuds',
  'earpods',
  'airpods',
  'beats',
  'buds',
  '이어폰',
  '헤드폰',
  '헤드셋',
  'hands-free',
  'hands free',
  'hf audio',
  'a2dp',
]

export type HeadphoneStatus = 'present' | 'absent' | 'unknown'

export async function detectHeadphones(): Promise<HeadphoneStatus> {
  if (!navigator.mediaDevices?.enumerateDevices) return 'unknown'
  try {
    const devices = await navigator.mediaDevices.enumerateDevices()
    const outputs = devices.filter((d) => d.kind === 'audiooutput')
    if (outputs.length === 0) return 'unknown'
    const haveLabels = outputs.some((d) => d.label.length > 0)
    if (!haveLabels) return 'unknown'
    const lower = outputs.map((d) => d.label.toLowerCase())
    const hit = lower.some((label) => KEYWORDS.some((k) => label.includes(k)))
    return hit ? 'present' : 'absent'
  } catch {
    return 'unknown'
  }
}

export function onDeviceChange(handler: () => void): () => void {
  if (!navigator.mediaDevices?.addEventListener) return () => {}
  navigator.mediaDevices.addEventListener('devicechange', handler)
  return () => navigator.mediaDevices.removeEventListener('devicechange', handler)
}
