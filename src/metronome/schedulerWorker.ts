/**
 * Dedicated Web Worker timer for the metronome scheduler.
 *
 * Why: in browsers, `setInterval` on the main thread is throttled to ~1 Hz when the tab is
 * hidden. The metronome's lookahead of 100 ms can't survive that. Dedicated workers run on
 * a separate thread and are far less aggressively throttled (Chrome currently does not
 * throttle dedicated workers' timers; Firefox/Safari behave similarly for foregrounded
 * windows). This keeps the click stream stable when the tab loses focus, which matters
 * because pianists often switch to score apps or other windows mid-practice.
 */

type InMessage = { cmd: 'start'; intervalMs: number } | { cmd: 'stop' }
type OutMessage = 'tick'

let timerId: ReturnType<typeof setInterval> | null = null

self.onmessage = (e: MessageEvent<InMessage>) => {
  const data = e.data
  if (data.cmd === 'start') {
    if (timerId !== null) clearInterval(timerId)
    const tick: OutMessage = 'tick'
    timerId = setInterval(() => {
      ;(self as unknown as Worker).postMessage(tick)
    }, data.intervalMs)
  } else if (data.cmd === 'stop') {
    if (timerId !== null) {
      clearInterval(timerId)
      timerId = null
    }
  }
}
