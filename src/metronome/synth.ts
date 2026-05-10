/**
 * Synthesize woodblock-like AudioBuffers in-memory at AudioContext init.
 * Uses additive sine partials + a short noise transient, with a fast exponential
 * decay envelope. Result is sample-accurate and indistinguishable from baked WAVs
 * for the metronome use case.
 */

export interface SampleBank {
  downbeat: AudioBuffer
  beat: AudioBuffer
  sub: AudioBuffer
  cue: AudioBuffer
  polySecondary: AudioBuffer
}

interface Spec {
  baseHz: number
  partials: number[]
  partialMix: number[]
  noiseAmp: number
  durationSec: number
  attackSec: number
  decaySec: number
  gain: number
}

function renderClick(ctx: BaseAudioContext, spec: Spec): AudioBuffer {
  const sampleRate = ctx.sampleRate
  const length = Math.ceil(spec.durationSec * sampleRate)
  const buf = ctx.createBuffer(1, length, sampleRate)
  const data = buf.getChannelData(0)
  const noiseSamples = Math.min(length, Math.ceil(0.004 * sampleRate))

  for (let i = 0; i < length; i++) {
    const t = i / sampleRate

    let env: number
    if (t < spec.attackSec) {
      env = t / spec.attackSec
    } else {
      const dt = t - spec.attackSec
      env = Math.exp(-dt / spec.decaySec)
    }

    let s = 0
    for (let p = 0; p < spec.partials.length; p++) {
      s += Math.sin(2 * Math.PI * spec.baseHz * spec.partials[p]! * t) * (spec.partialMix[p] ?? 0)
    }

    if (i < noiseSamples) {
      const n = (Math.random() * 2 - 1) * spec.noiseAmp * (1 - i / noiseSamples)
      s += n
    }

    data[i] = Math.tanh(s * env * spec.gain)
  }
  return buf
}

export function buildSampleBank(ctx: BaseAudioContext): SampleBank {
  const downbeat = renderClick(ctx, {
    baseHz: 1568,
    partials: [1, 2, 3.5],
    partialMix: [1.0, 0.35, 0.18],
    noiseAmp: 0.5,
    durationSec: 0.06,
    attackSec: 0.001,
    decaySec: 0.018,
    gain: 0.95,
  })

  const beat = renderClick(ctx, {
    baseHz: 988,
    partials: [1, 2.05, 3.1],
    partialMix: [1.0, 0.28, 0.12],
    noiseAmp: 0.35,
    durationSec: 0.05,
    attackSec: 0.001,
    decaySec: 0.016,
    gain: 0.7,
  })

  const sub = renderClick(ctx, {
    baseHz: 660,
    partials: [1, 2.1],
    partialMix: [1.0, 0.18],
    noiseAmp: 0.18,
    durationSec: 0.04,
    attackSec: 0.001,
    decaySec: 0.012,
    gain: 0.45,
  })

  const cue = renderClick(ctx, {
    baseHz: 1976,
    partials: [1, 2, 3, 4.5],
    partialMix: [1.0, 0.5, 0.35, 0.2],
    noiseAmp: 0.2,
    durationSec: 0.18,
    attackSec: 0.002,
    decaySec: 0.06,
    gain: 0.9,
  })

  const polySecondary = renderClick(ctx, {
    baseHz: 740,
    partials: [1, 2.3, 3.7],
    partialMix: [1.0, 0.3, 0.15],
    noiseAmp: 0.25,
    durationSec: 0.05,
    attackSec: 0.001,
    decaySec: 0.014,
    gain: 0.62,
  })

  return { downbeat, beat, sub, cue, polySecondary }
}
