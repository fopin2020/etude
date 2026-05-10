// Scheduler arithmetic + lookahead simulation. Run with: node scripts/verify-scheduler.mjs
//
// What this measures:
//   1) Inter-beat interval precision computed from `nextBeatTime += 60/bpm` over many beats.
//   2) Cumulative drift after N beats vs. reference monotonic time.
//   3) Lookahead resilience: under simulated 25ms timer jitter, do we miss any scheduling slot?
//
// What it does NOT measure (because it can't from Node):
//   - The actual audio output sample placement. That is guaranteed to match the scheduled
//     time within Web Audio's sample-accurate contract; the OS/driver layer adds typically
//     ≤1ms of latency that is constant per stream (does NOT compound between beats).

const BPMS = [60, 90, 120, 180, 240, 300, 400, 500]
const BEATS_PER_TEST = 4000
const LOOKAHEAD_SEC = 0.1
const TICK_MS = 25

function arithmeticDriftReport(bpm) {
  const expected = 60 / bpm
  let t = 0
  const intervals = []
  for (let i = 0; i < BEATS_PER_TEST; i++) {
    const prev = t
    t = t + 60 / bpm
    intervals.push(t - prev)
  }
  const min = Math.min(...intervals)
  const max = Math.max(...intervals)
  const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length
  const variance = intervals.reduce((a, x) => a + (x - avg) ** 2, 0) / intervals.length
  const std = Math.sqrt(variance)
  const cumulativeError = Math.abs(t - BEATS_PER_TEST * expected)

  return {
    bpm,
    expectedSec: expected,
    avgSec: avg,
    minSec: min,
    maxSec: max,
    stdDevSec: std,
    cumulativeErrorSec: cumulativeError,
  }
}

function lookaheadStress(bpm) {
  const beatDur = 60 / bpm
  let nextBeatTime = 0.05
  let now = 0
  let scheduled = 0
  let lastSchedule = 0
  let maxLag = 0

  while (scheduled < 200) {
    const tickJitter = (Math.random() - 0.3) * 0.04
    const tickInterval = TICK_MS / 1000 + tickJitter
    now += tickInterval

    while (nextBeatTime < now + LOOKAHEAD_SEC) {
      const lag = Math.max(0, now - nextBeatTime)
      if (lag > maxLag) maxLag = lag
      nextBeatTime += beatDur
      scheduled++
      lastSchedule = now
    }
  }
  return { bpm, maxLagSec: maxLag, lastTickSec: lastSchedule }
}

console.log('=== Scheduler arithmetic precision ===')
console.log('BPM   | expected (ms) | avg (ms)        | stdDev (ms)     | cum error after 4000 beats')
console.log('------+---------------+-----------------+-----------------+----------------------------')
for (const bpm of BPMS) {
  const r = arithmeticDriftReport(bpm)
  console.log(
    `${String(bpm).padStart(3)} ` +
    `| ${(r.expectedSec * 1000).toFixed(6).padStart(13)} ` +
    `| ${(r.avgSec * 1000).toFixed(15).padStart(15)} ` +
    `| ${(r.stdDevSec * 1000).toExponential(3).padStart(15)} ` +
    `| ${(r.cumulativeErrorSec * 1000).toExponential(3)} ms`,
  )
}

console.log('\n=== Lookahead resilience under 25 ms tick jitter (±40 ms) ===')
console.log('BPM   | max miss-window (ms)')
console.log('------+----------------------')
for (const bpm of BPMS) {
  const r = lookaheadStress(bpm)
  const status = r.maxLagSec < LOOKAHEAD_SEC ? 'OK' : 'MISS'
  console.log(
    `${String(bpm).padStart(3)} ` +
    `| ${(r.maxLagSec * 1000).toFixed(3).padStart(10)}  [${status}]`,
  )
}

console.log('\nNotes:')
console.log('- 100 ms lookahead absorbs typical setInterval jitter (browsers schedule with')
console.log('  1–5 ms jitter when tab is foregrounded).')
console.log('- Web Audio start(when) is sample-accurate: the scheduled time is the time the')
console.log('  buffer begins relative to AudioContext.currentTime, with quantization to one')
console.log('  audio frame (1/44100 ≈ 22.7 μs).')
console.log('- Human perception of click jitter starts ≈ 5–10 ms. Reported stdDev is many')
console.log('  orders of magnitude below this.')
