import { useState, useEffect, useRef, useCallback } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────
type Screen = 'meditation' | 'sounds'
type TimerState = 'idle' | 'running' | 'paused'

interface Sound {
  id: string
  label: string
  subtitle: string
  photo: string
  accentColor: string
  generate: (ctx: AudioContext) => AudioNode | null
}

// ─── Web Audio Generators ─────────────────────────────────────────────────────
function makeNoiseBuffer(ctx: AudioContext, color: 'white' | 'pink' | 'brown') {
  const len = ctx.sampleRate * 3
  const buf = ctx.createBuffer(1, len, ctx.sampleRate)
  const d = buf.getChannelData(0)
  if (color === 'white') {
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1
  } else if (color === 'pink') {
    let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1
      b0=0.99886*b0+w*0.0555179; b1=0.99332*b1+w*0.0750759
      b2=0.96900*b2+w*0.1538520; b3=0.86650*b3+w*0.3104856
      b4=0.55000*b4+w*0.5329522; b5=-0.7616*b5-w*0.0168980
      d[i]=(b0+b1+b2+b3+b4+b5+b6+w*0.5362)*0.11; b6=w*0.115926
    }
  } else {
    let last=0
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1
      d[i]=(last+0.02*w)/1.02; last=d[i]; d[i]*=3.5
    }
  }
  return buf
}

function noiseSource(ctx: AudioContext, color: 'white'|'pink'|'brown') {
  const src = ctx.createBufferSource()
  src.buffer = makeNoiseBuffer(ctx, color)
  src.loop = true
  return src
}

const SOUNDS: Sound[] = [
  {
    id: 'ocean',
    label: 'Ocean Waves',
    subtitle: 'Deep water rhythms',
    photo: 'https://images.unsplash.com/photo-1560260240-c6ef90a163a4?w=600&h=400&fit=crop&auto=format',
    accentColor: '#38bdf8',
    generate: (ctx) => {
      const src = noiseSource(ctx, 'pink')
      const lp = ctx.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=350; lp.Q.value=0.8
      const gain = ctx.createGain(); gain.gain.value=0.35
      const lfo = ctx.createOscillator(); lfo.frequency.value=0.12
      const lfoGain = ctx.createGain(); lfoGain.gain.value=0.12
      lfo.connect(lfoGain); lfoGain.connect(gain.gain)
      src.connect(lp); lp.connect(gain)
      src.start(); lfo.start()
      return gain
    },
  },
  {
    id: 'forest',
    label: 'Forest Rain',
    subtitle: 'Leaves & rainfall',
    photo: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=600&h=400&fit=crop&auto=format',
    accentColor: '#34d399',
    generate: (ctx) => {
      const src = noiseSource(ctx, 'pink')
      const hp = ctx.createBiquadFilter(); hp.type='highpass'; hp.frequency.value=200
      const lp = ctx.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=1800
      const gain = ctx.createGain(); gain.gain.value=0.28
      src.connect(hp); hp.connect(lp); lp.connect(gain)
      src.start()
      return gain
    },
  },
  {
    id: 'fire',
    label: 'Crackling Fire',
    subtitle: 'Warm embers',
    photo: 'https://images.unsplash.com/photo-1475483768296-6163e08872a1?w=600&h=400&fit=crop&auto=format',
    accentColor: '#fb923c',
    generate: (ctx) => {
      const src = noiseSource(ctx, 'brown')
      const lp = ctx.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=700
      const gain = ctx.createGain(); gain.gain.value=0.5
      const lfo = ctx.createOscillator(); lfo.frequency.value=0.8; lfo.type='sawtooth'
      const lfoGain = ctx.createGain(); lfoGain.gain.value=0.05
      lfo.connect(lfoGain); lfoGain.connect(gain.gain)
      src.connect(lp); lp.connect(gain)
      src.start(); lfo.start()
      return gain
    },
  },
  {
    id: 'rain',
    label: 'Gentle Rain',
    subtitle: 'Soft pitter-patter',
    photo: 'https://images.unsplash.com/photo-1567688993206-43c34131b21f?w=600&h=400&fit=crop&auto=format',
    accentColor: '#7dd3fc',
    generate: (ctx) => {
      const src = noiseSource(ctx, 'white')
      const hp = ctx.createBiquadFilter(); hp.type='highpass'; hp.frequency.value=1000
      const lp = ctx.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=8000
      const gain = ctx.createGain(); gain.gain.value=0.18
      const lfo = ctx.createOscillator(); lfo.frequency.value=2.5
      const lfoGain = ctx.createGain(); lfoGain.gain.value=0.04
      lfo.connect(lfoGain); lfoGain.connect(gain.gain)
      src.connect(hp); hp.connect(lp); lp.connect(gain)
      src.start(); lfo.start()
      return gain
    },
  },
  {
    id: 'wind',
    label: 'Mountain Wind',
    subtitle: 'Alpine stillness',
    photo: 'https://images.unsplash.com/photo-1477468572316-36979010099d?w=600&h=400&fit=crop&auto=format',
    accentColor: '#a3e635',
    generate: (ctx) => {
      const src = noiseSource(ctx, 'white')
      const bp = ctx.createBiquadFilter(); bp.type='bandpass'; bp.frequency.value=600; bp.Q.value=0.3
      const gain = ctx.createGain(); gain.gain.value=0.22
      const lfo = ctx.createOscillator(); lfo.frequency.value=0.05
      const lfoGain = ctx.createGain(); lfoGain.gain.value=0.18
      lfo.connect(lfoGain); lfoGain.connect(gain.gain)
      src.connect(bp); bp.connect(gain)
      src.start(); lfo.start()
      return gain
    },
  },
  {
    id: 'bowls',
    label: 'Singing Bowls',
    subtitle: 'Tibetan resonance',
    photo: 'https://images.unsplash.com/photo-1579291465308-fba6c5db2dfe?w=600&h=400&fit=crop&auto=format',
    accentColor: '#c084fc',
    generate: (ctx) => {
      const merger = ctx.createGain(); merger.gain.value=0.6
      const freqs = [220, 330, 440, 660]
      freqs.forEach((f, i) => {
        const osc = ctx.createOscillator(); osc.type='sine'; osc.frequency.value=f
        const g = ctx.createGain(); g.gain.value = 0.15 / (i + 1)
        osc.connect(g); g.connect(merger)
        osc.start()
        // Subtle tremolo
        const lfo = ctx.createOscillator(); lfo.frequency.value=0.3+i*0.1
        const lg = ctx.createGain(); lg.gain.value=0.02
        lfo.connect(lg); lg.connect(g.gain); lfo.start()
      })
      return merger
    },
  },
  {
    id: 'silence',
    label: 'Pure Silence',
    subtitle: 'No sound',
    photo: 'https://images.unsplash.com/photo-1498813295229-27bd6c349cc8?w=600&h=400&fit=crop&auto=format',
    accentColor: '#94a3b8',
    generate: () => null,
  },
]

const DURATIONS = [5, 10, 15, 20]

function fmt(s: number) {
  return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`
}

// ─── Aurora Background ────────────────────────────────────────────────────────
function AuroraBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: 'linear-gradient(180deg, #080620 0%, #0a0d2e 55%, #070d1f 100%)' }}>
      {/* Slow indigo bloom — top center */}
      <div style={{
        position: 'absolute', width: '130%', height: '130%',
        top: '-30%', left: '-15%',
        background: 'radial-gradient(ellipse at 50% 40%, rgba(72,52,160,0.38) 0%, transparent 60%)',
        animation: 'aurora-1 50s ease-in-out infinite',
        filter: 'blur(70px)',
      }} />
      {/* Soft teal — bottom left */}
      <div style={{
        position: 'absolute', width: '100%', height: '100%',
        bottom: '-10%', left: '-10%',
        background: 'radial-gradient(ellipse at 20% 80%, rgba(14,116,144,0.22) 0%, transparent 55%)',
        animation: 'aurora-2 65s ease-in-out infinite',
        filter: 'blur(80px)',
      }} />
      {/* Muted violet — right mid */}
      <div style={{
        position: 'absolute', width: '80%', height: '80%',
        top: '20%', right: '-10%',
        background: 'radial-gradient(ellipse at 70% 50%, rgba(88,56,190,0.18) 0%, transparent 55%)',
        animation: 'aurora-3 80s ease-in-out infinite',
        filter: 'blur(90px)',
      }} />
      {/* Deep blue base wash */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 50% 60%, rgba(15,30,90,0.5) 0%, transparent 70%)',
      }} />
      {/* Stars — very faint */}
      {Array.from({length: 55}, (_,i) => (
        <div key={i} style={{
          position: 'absolute',
          width: i%8===0 ? 1.5 : 1,
          height: i%8===0 ? 1.5 : 1,
          borderRadius: '50%',
          background: '#fff',
          top: `${(i*43+7)%100}%`,
          left: `${(i*67+11)%100}%`,
          opacity: 0.08 + (i%4)*0.06,
          animation: `ring-glow ${5+i%7}s ease-in-out ${i*0.4}s infinite`,
        }} />
      ))}
      {/* Bottom fade to deeper dark */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '35%',
        background: 'linear-gradient(to top, rgba(4,3,18,0.6) 0%, transparent 100%)',
      }} />
      {/* Edge vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 50% 50%, transparent 50%, rgba(3,2,15,0.55) 100%)',
      }} />
    </div>
  )
}

// ─── Progress Ring ─────────────────────────────────────────────────────────────
function ProgressRing({ progress, size }: { progress: number; size: number }) {
  const sw = 5, r = (size - sw*2)/2, cx = size/2, cy = size/2
  const circ = 2*Math.PI*r
  const offset = circ * (1 - Math.max(0, Math.min(1, progress)))
  const headAngle = progress * 2 * Math.PI - Math.PI/2
  const hx = cx + Math.cos(headAngle)*r
  const hy = cy + Math.sin(headAngle)*r

  const ticks = Array.from({length:60},(_,i)=>{
    const a=(i/60)*2*Math.PI-Math.PI/2, major=i%5===0
    const or=size/2-1, ir=or-(major?10:5)
    return {x1:cx+Math.cos(a)*or,y1:cy+Math.sin(a)*or,x2:cx+Math.cos(a)*ir,y2:cy+Math.sin(a)*ir,major}
  })

  return (
    <svg width={size} height={size} style={{transform:'rotate(-90deg)'}}>
      <defs>
        <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818cf8"/>
          <stop offset="50%" stopColor="#a78bfa"/>
          <stop offset="100%" stopColor="#22d3ee"/>
        </linearGradient>
        <filter id="arcGlow">
          <feGaussianBlur stdDeviation="5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="dotGlow">
          <feGaussianBlur stdDeviation="3" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {ticks.map((t,i)=>(
        <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
          stroke={t.major?'rgba(165,180,252,0.35)':'rgba(165,180,252,0.12)'}
          strokeWidth={t.major?1.5:0.8} strokeLinecap="round"/>
      ))}
      <circle cx={cx} cy={cy} r={r} fill="none"
        stroke="rgba(99,102,241,0.12)" strokeWidth={sw}/>
      <circle cx={cx} cy={cy} r={r} fill="none"
        stroke="url(#arcGrad)" strokeWidth={sw} strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset}
        filter="url(#arcGlow)"
        style={{transition:'stroke-dashoffset 1s linear'}}/>
      {progress>0.01 && progress<0.999 && (
        <circle cx={hx} cy={hy} r={6} fill="#a78bfa" filter="url(#dotGlow)"/>
      )}
    </svg>
  )
}

// ─── Audio Hook ────────────────────────────────────────────────────────────────
function useAudio() {
  const ctxRef = useRef<AudioContext | null>(null)
  const nodeRef = useRef<AudioNode | null>(null)

  const play = useCallback((sound: Sound) => {
    // Stop previous
    if (nodeRef.current) {
      try { (nodeRef.current as AudioNode & {stop?:()=>void}).stop?.() } catch {}
      try { nodeRef.current.disconnect() } catch {}
      nodeRef.current = null
    }
    if (sound.id === 'silence') return

    if (!ctxRef.current || ctxRef.current.state === 'closed') {
      ctxRef.current = new AudioContext()
    }
    const ctx = ctxRef.current
    if (ctx.state === 'suspended') ctx.resume()

    const node = sound.generate(ctx)
    if (node) {
      node.connect(ctx.destination)
      nodeRef.current = node
    }
  }, [])

  const stop = useCallback(() => {
    if (nodeRef.current) {
      try { (nodeRef.current as AudioNode & {stop?:()=>void}).stop?.() } catch {}
      try { nodeRef.current.disconnect() } catch {}
      nodeRef.current = null
    }
  }, [])

  useEffect(() => () => stop(), [stop])
  return { play, stop }
}

// ─── Waveform bars ─────────────────────────────────────────────────────────────
function WaveBars({ color, count=5, playing=false }: { color:string; count?:number; playing?:boolean }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:2, height:20 }}>
      {Array.from({length:count},(_,i)=>(
        <div key={i} style={{
          width:3, height:'100%', borderRadius:2,
          background: color,
          transformOrigin:'center',
          transform: playing?undefined:'scaleY(0.25)',
          animation: playing ? `bar-dance ${0.6+i*0.15}s ease-in-out ${i*0.1}s infinite` : 'none',
          transition:'transform 0.3s',
        }}/>
      ))}
    </div>
  )
}

// ─── Meditation Screen ─────────────────────────────────────────────────────────
function MeditationScreen({ selectedSound, onGoSounds }: { selectedSound:Sound; onGoSounds:()=>void }) {
  const [duration, setDuration] = useState(10)
  const [secondsLeft, setSecondsLeft] = useState(600)
  const [state, setState] = useState<TimerState>('idle')
  const { play, stop } = useAudio()
  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null)

  const progress = state==='idle' ? 0 : 1 - secondsLeft/(duration*60)

  // Play/stop sound with timer
  useEffect(() => {
    if (state==='running') play(selectedSound)
    else stop()
  }, [state, selectedSound, play, stop])

  useEffect(() => {
    if (state==='running') {
      timerRef.current = setInterval(()=>{
        setSecondsLeft(s=>{
          if (s<=1) { clearInterval(timerRef.current!); setState('idle'); return 0 }
          return s-1
        })
      },1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return ()=>{ if (timerRef.current) clearInterval(timerRef.current) }
  }, [state])

  const setDur = (d:number) => {
    setDuration(d); setSecondsLeft(d*60); setState('idle')
  }
  const start = () => { if (state==='idle') setSecondsLeft(duration*60); setState('running') }
  const pause = () => setState('paused')
  const reset = () => { setState('idle'); setSecondsLeft(duration*60) }

  return (
    <div className="relative flex flex-col h-full overflow-hidden select-none">
      <AuroraBackground/>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-12 pb-2">
        <div>
          <p style={{fontFamily:'Nunito',fontSize:10,letterSpacing:'0.15em',textTransform:'uppercase',color:'rgba(165,180,252,0.65)',fontWeight:700}}>
            {state==='running'?'In Session':state==='paused'?'Paused':'Ready'}
          </p>
          <h1 style={{fontFamily:'DM Serif Display',fontSize:22,color:'#f1f5f9',marginTop:2}}>
            Mindful Moment
          </h1>
        </div>
        {/* Sound badge */}
        <button onClick={onGoSounds}
          className="flex items-center gap-2 transition-all active:scale-95"
          style={{
            padding:'8px 14px', borderRadius:40,
            background:'rgba(255,255,255,0.07)',
            border:'1px solid rgba(255,255,255,0.12)',
          }}>
          <WaveBars color={selectedSound.accentColor} count={4} playing={state==='running'}/>
          <span style={{fontFamily:'Nunito',fontSize:12,fontWeight:700,color:'rgba(226,232,240,0.85)'}}>
            {selectedSound.label}
          </span>
        </button>
      </div>

      {/* Duration pills */}
      <div className="relative z-10 flex justify-center gap-2 px-6 mt-4">
        {DURATIONS.map(d=>(
          <button key={d} onClick={()=>setDur(d)} disabled={state==='running'}
            className="transition-all active:scale-95"
            style={{
              padding:'6px 16px', borderRadius:40,
              fontFamily:'Nunito', fontSize:13, fontWeight:700,
              background: duration===d ? 'linear-gradient(135deg,rgba(99,102,241,0.55),rgba(167,139,250,0.55))' : 'rgba(255,255,255,0.05)',
              border: duration===d ? '1px solid rgba(167,139,250,0.5)' : '1px solid rgba(255,255,255,0.08)',
              color: duration===d ? '#e2e8f0' : 'rgba(148,163,184,0.6)',
              opacity: state==='running' ? 0.4 : 1,
            }}>
            {d}m
          </button>
        ))}
      </div>

      {/* Timer ring */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1">
        <div style={{position:'relative',width:280,height:280}}>
          {/* Glow behind ring */}
          <div style={{
            position:'absolute', inset:0, borderRadius:'50%',
            background:'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
            filter:'blur(20px)',
          }}/>
          <ProgressRing progress={progress} size={280}/>
          {/* Center */}
          <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
            {state==='running' && (
              <div className="breathe-anim" style={{marginBottom:6}}>
                <div style={{width:8,height:8,borderRadius:'50%',background:'rgba(167,139,250,0.9)'}}/>
              </div>
            )}
            <span style={{fontFamily:'DM Serif Display',fontSize:54,color:'#f8fafc',lineHeight:1,letterSpacing:'-2px'}}>
              {fmt(state==='idle' ? duration*60 : secondsLeft)}
            </span>
            <span style={{
              fontFamily:'Nunito',fontSize:11,letterSpacing:'0.15em',textTransform:'uppercase',fontWeight:600,
              color:'rgba(148,163,184,0.45)',marginTop:8,
            }}>
              {state==='idle'?'tap to begin':state==='running'?'breathe deeply':'resume anytime'}
            </span>
          </div>
        </div>

        {/* Breath guide */}
        {state==='running' && (
          <div className="float-anim" style={{marginTop:20,display:'flex',flexDirection:'column',alignItems:'center',gap:8}}>
            <div style={{display:'flex',gap:4,alignItems:'flex-end'}}>
              {[14,22,18,26,14].map((h,i)=>(
                <div key={i} style={{
                  width:4,height:h,borderRadius:2,
                  background:`rgba(167,139,250,${0.25+i*0.12})`,
                  animation:`bar-dance ${1+i*0.2}s ease-in-out ${i*0.1}s infinite`,
                }}/>
              ))}
            </div>
            <span style={{fontFamily:'Nunito',fontSize:11,color:'rgba(148,163,184,0.45)',letterSpacing:'0.1em'}}>
              4 · 4 · 4 breathing
            </span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="relative z-10 flex items-center justify-center gap-6 pb-14 pt-4">
        {/* Reset */}
        <button onClick={reset} className="transition-all active:scale-90"
          style={{
            width:52,height:52,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',
            background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',
            color:'rgba(148,163,184,0.7)',
          }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
          </svg>
        </button>

        {/* Play/Pause */}
        <button onClick={state==='running'?pause:start} className="transition-all active:scale-90"
          style={{
            width:78,height:78,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',
            background:'linear-gradient(135deg,#6366f1 0%,#8b5cf6 50%,#22d3ee 100%)',
            boxShadow:'0 0 35px rgba(99,102,241,0.55),0 0 70px rgba(99,102,241,0.2)',
            color:'#fff',
          }}>
          {state==='running'
            ? <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
            : <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" style={{marginLeft:3}}><path d="M5 3l14 9-14 9V3z"/></svg>
          }
        </button>

        {/* Spacer */}
        <div style={{width:52,height:52}}/>
      </div>
    </div>
  )
}

// ─── Sound Card ───────────────────────────────────────────────────────────────
function SoundCard({ sound, selected, onSelect }: { sound:Sound; selected:boolean; onSelect:()=>void }) {
  return (
    <button onClick={onSelect} className="relative overflow-hidden transition-all active:scale-95"
      style={{
        borderRadius:18, aspectRatio:'1/1.1',
        border: selected ? `2px solid ${sound.accentColor}` : '2px solid rgba(255,255,255,0.07)',
        boxShadow: selected ? `0 0 20px ${sound.accentColor}44` : 'none',
      }}>
      {/* Photo */}
      <img src={sound.photo} alt={sound.label}
        style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}}/>
      {/* Overlay */}
      <div style={{
        position:'absolute',inset:0,
        background: selected
          ? `linear-gradient(to top, ${sound.accentColor}cc 0%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.1) 100%)`
          : 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.1) 100%)',
        transition:'background 0.3s',
      }}/>
      {/* Selected check */}
      {selected && (
        <div style={{
          position:'absolute',top:10,right:10,
          width:22,height:22,borderRadius:'50%',
          background:sound.accentColor,
          display:'flex',alignItems:'center',justifyContent:'center',
        }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}
      {/* Label */}
      <div style={{position:'absolute',bottom:0,left:0,right:0,padding:'10px 12px'}}>
        <p style={{fontFamily:'Nunito',fontWeight:800,fontSize:13,color:'#fff',lineHeight:1.2}}>
          {sound.label}
        </p>
        <p style={{fontFamily:'Nunito',fontSize:10,color:'rgba(255,255,255,0.65)',marginTop:2}}>
          {sound.subtitle}
        </p>
        {selected && (
          <div style={{marginTop:6}}>
            <WaveBars color={sound.accentColor} count={5} playing={true}/>
          </div>
        )}
      </div>
    </button>
  )
}

// ─── Sounds Screen ─────────────────────────────────────────────────────────────
function SoundsScreen({ selected, onSelect, onBack }: { selected:Sound; onSelect:(s:Sound)=>void; onBack:()=>void }) {
  return (
    <div className="relative flex flex-col h-full overflow-hidden select-none">
      <AuroraBackground/>

      {/* Header */}
      <div className="relative z-10 flex items-center gap-4 px-6 pt-12 pb-4">
        <button onClick={onBack} className="transition-all active:scale-90"
          style={{
            width:40,height:40,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',
            background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.12)',
            color:'rgba(203,213,225,0.8)',
          }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>
        <div>
          <p style={{fontFamily:'Nunito',fontSize:10,letterSpacing:'0.15em',textTransform:'uppercase',color:'rgba(165,180,252,0.65)',fontWeight:700}}>
            Ambience
          </p>
          <h2 style={{fontFamily:'DM Serif Display',fontSize:22,color:'#f1f5f9'}}>
            Choose Your Sound
          </h2>
        </div>
      </div>

      {/* Now playing strip */}
      <div className="relative z-10 mx-6 mb-5 flex items-center gap-3"
        style={{
          padding:'12px 16px',borderRadius:16,
          background:'rgba(255,255,255,0.05)',
          border:`1px solid ${selected.accentColor}44`,
        }}>
        <div style={{
          width:40,height:40,borderRadius:12,overflow:'hidden',flexShrink:0,
          background:selected.accentColor+'22',
        }}>
          <img src={selected.photo} alt={selected.label} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
        </div>
        <div style={{flex:1}}>
          <p style={{fontFamily:'Nunito',fontSize:11,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',color:selected.accentColor,opacity:0.8}}>
            Now Playing
          </p>
          <p style={{fontFamily:'Nunito',fontSize:14,fontWeight:700,color:'#e2e8f0',marginTop:1}}>
            {selected.label}
          </p>
        </div>
        <WaveBars color={selected.accentColor} count={5} playing={selected.id!=='silence'}/>
      </div>

      {/* Grid */}
      <div className="relative z-10 flex-1 overflow-y-auto px-6 pb-10">
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          {SOUNDS.map(s=>(
            <SoundCard key={s.id} sound={s} selected={selected.id===s.id} onSelect={()=>onSelect(s)}/>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState<Screen>('meditation')
  const [selectedSound, setSelectedSound] = useState<Sound>(SOUNDS[0])

  const handleSelectSound = (s:Sound) => {
    setSelectedSound(s)
    setScreen('meditation')
  }

  return (
    <div style={{
      display:'flex', alignItems:'center', justifyContent:'center',
      minHeight:'100vh', background:'#020110',
    }}>
      <div style={{
        width:'100%', maxWidth:390,
        height:'100vh', maxHeight:844,
        overflow:'hidden', position:'relative',
        borderRadius:'clamp(0px, calc((100vh - 844px) * 999), 44px)',
        boxShadow:'0 40px 100px rgba(0,0,0,0.7)',
        fontFamily:'Nunito,sans-serif',
      }}>
        {screen==='meditation'
          ? <MeditationScreen selectedSound={selectedSound} onGoSounds={()=>setScreen('sounds')}/>
          : <SoundsScreen selected={selectedSound} onSelect={handleSelectSound} onBack={()=>setScreen('meditation')}/>
        }
      </div>
    </div>
  )
}
