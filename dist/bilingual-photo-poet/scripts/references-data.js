/**
 * Default Curated Reference Materials for Bilingual Photo Poet
 * Available out-of-the-box for Google AI Edge Gallery & Gemma models.
 */
const DEFAULT_REFERENCES = [
  {
    id: "ref-sangam-thinai",
    title: "Sangam Thinai Landscapes (சங்கத் திணை மரபு)",
    author: "Classical Sangam Academy (சங்க காலம்)",
    category: "Classical",
    tag: "Sangam Thinai",
    enabled: true,
    summary: "Maps visual landscapes to 5 primal emotional realms (Kurinji/Mountains, Mullai/Forests, Marutham/Plains, Neythal/Sea, Paalai/Desert).",
    guidelines: `1. Identify the predominant terrain or mood in the photo:
   - Mountain/mist/waterfall -> Kurinji (Union & awe)
   - Forest/rain/twilight -> Mullai (Patient awaiting)
   - Rivers/fields/lakes -> Marutham (Harmonious abundance)
   - Oceans/waves/beaches -> Neythal (Deep yearning/separation)
   - Sun-baked paths/desolation -> Paalai (Resilience & courage)
2. Embed the corresponding nature metaphors directly into the Tamil and English verses.
3. In Tamil, employ evocative Sangam roots (புனல், பொழில், விடியல், அலை, குன்றம்).`
  },
  {
    id: "ref-bharathiyar-modern",
    title: "Mahakavi Bharathiyar Style (பாரதியார் புதுக்கவிதை நடை)",
    author: "Subramania Bharati (மகாகவி பாரதி)",
    category: "Modern Free Verse",
    tag: "Bharathiyar Rhythm",
    enabled: true,
    summary: "Urgent rhythmic tempo, vibrant imagery of freedom, fiery vitality, and fearless direct address to nature's cosmic energy.",
    guidelines: `1. Maintain a driving, musical rhythm (சந்த நயம்) suitable for loud recitation.
2. Direct address to the elements (speaking to wind, light, sea, or soul).
3. Ensure crisp Monai (மோனை - first-letter match) and Ethugai (எதுகை - second-letter harmony).
4. English pairing should reflect ecstatic transcendental free verse in the vein of Blake or Whitman.`
  },
  {
    id: "ref-thirukkural-meter",
    title: "Thirukkural Venba Couplet (திருக்குறள் வெண்பா யாப்பு)",
    author: "Thiruvalluvar (திருவள்ளுவர்)",
    category: "Philosophical Couplet",
    tag: "Kural Venba",
    enabled: false,
    summary: "Succinct 7-word Kural venba (4 words in first line, 3 in second) encapsulating universal ethical or philosophical depth.",
    guidelines: `1. Structure the Tamil couplet strictly into two lines:
   - Line 1: 4 Cir (metrical words)
   - Line 2: 3 Cir (metrical words)
2. Include second-letter rhyming (எதுகை) between both lines.
3. Distill the photo's visual story into a timeless aphorism of virtue, love, or life wisdom.
4. English pairing should be a tight, memorable 2-line philosophical epigram.`
  },
  {
    id: "ref-haiku-nature",
    title: "Bilingual Nature Haiku (இருமொழி குறுங்கவிதை & துளிப்பா)",
    author: "Zen & Modern Tamil Pudhukavithai",
    category: "Micro-Verse",
    tag: "Haiku 5-7-5",
    enabled: false,
    summary: "Three-line sensory freeze-frames capturing an ephemeral spark of time with an unexpected poignant twist.",
    guidelines: `1. English structure: 3 lines adhering to the 5-7-5 syllable breath.
2. Tamil structure: 3 concise lines (துளிப்பா) capturing an immediate sensory detail.
3. Ground the poem in immediate sensory textures: light, moisture, silence, or sudden movement.
4. Conclude with an illuminating emotional turn (kireji / திருப்புமுனை).`
  }
];

// Sample showcase images for instant zero-friction demonstration
const SAMPLE_PREVIEWS = [
  {
    id: "sample-dawn",
    name: "Golden Temple at Dawn (விடியல் கோபுரம்)",
    theme: "Spiritual & Majestic",
    dominantColor: "#f59e0b",
    thinai: "Marutham / Kurinji",
    src: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#1e1b4b"/>
            <stop offset="40%" stop-color="#701a75"/>
            <stop offset="70%" stop-color="#f59e0b"/>
            <stop offset="100%" stop-color="#fef08a"/>
          </linearGradient>
          <linearGradient id="gopuram" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#18181b"/>
            <stop offset="50%" stop-color="#3f3f46"/>
            <stop offset="100%" stop-color="#18181b"/>
          </linearGradient>
        </defs>
        <rect width="600" height="400" fill="url(#sky)"/>
        <circle cx="300" cy="270" r="110" fill="#fef08a" opacity="0.85"/>
        <polygon points="300,50 250,340 350,340" fill="url(#gopuram)"/>
        <polygon points="300,30 292,50 308,50" fill="#f59e0b"/>
        <!-- Kalasams -->
        <circle cx="300" cy="25" r="4" fill="#fbbf24"/>
        <circle cx="293" cy="30" r="3" fill="#fbbf24"/>
        <circle cx="307" cy="30" r="3" fill="#fbbf24"/>
        <!-- Gopuram Tiers -->
        <line x1="265" y1="120" x2="335" y2="120" stroke="#f59e0b" stroke-width="2"/>
        <line x1="260" y1="180" x2="340" y2="180" stroke="#f59e0b" stroke-width="2"/>
        <line x1="255" y1="240" x2="345" y2="240" stroke="#f59e0b" stroke-width="2"/>
        <line x1="252" y1="290" x2="348" y2="290" stroke="#f59e0b" stroke-width="2"/>
        <!-- Base ground & river reflection -->
        <rect y="340" width="600" height="60" fill="#09090b"/>
        <ellipse cx="300" cy="365" rx="140" ry="15" fill="#f59e0b" opacity="0.3"/>
        <text x="20" y="380" fill="#e4e4e7" font-family="sans-serif" font-size="14" font-weight="600">Dravidian Gopuram at Sunrise | விடியல் திருக்கோயில்</text>
      </svg>
    `)
  },
  {
    id: "sample-rain",
    name: "Monsoon Drops on Lotus (தாமரை மழைத்துளி)",
    theme: "Peace & Purity",
    dominantColor: "#06b6d4",
    thinai: "Marutham / Mullai",
    src: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
        <defs>
          <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#0f172a"/>
            <stop offset="60%" stop-color="#064e3b"/>
            <stop offset="100%" stop-color="#022c22"/>
          </linearGradient>
          <linearGradient id="petal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#f472b6"/>
            <stop offset="70%" stop-color="#ec4899"/>
            <stop offset="100%" stop-color="#be185d"/>
          </linearGradient>
        </defs>
        <rect width="600" height="400" fill="url(#bg)"/>
        <!-- Water ripples -->
        <ellipse cx="300" cy="300" rx="220" ry="60" fill="none" stroke="#22d3ee" stroke-width="1.5" opacity="0.4"/>
        <ellipse cx="300" cy="300" rx="160" ry="40" fill="none" stroke="#22d3ee" stroke-width="1.2" opacity="0.6"/>
        <!-- Lotus Petals -->
        <path d="M 300,120 Q 240,250 300,280 Q 360,250 300,120 Z" fill="url(#petal)"/>
        <path d="M 270,160 Q 180,240 280,280 Q 240,220 270,160 Z" fill="url(#petal)" opacity="0.9"/>
        <path d="M 330,160 Q 420,240 320,280 Q 360,220 330,160 Z" fill="url(#petal)" opacity="0.9"/>
        <!-- Crystal Raindrop -->
        <circle cx="300" cy="210" r="14" fill="#a5f3fc" opacity="0.85"/>
        <circle cx="296" cy="206" r="4" fill="#ffffff"/>
        <!-- Rain Streaks -->
        <line x1="120" y1="20" x2="100" y2="120" stroke="#67e8f9" stroke-width="1" opacity="0.3"/>
        <line x1="450" y1="40" x2="430" y2="150" stroke="#67e8f9" stroke-width="1" opacity="0.3"/>
        <line x1="200" y1="80" x2="180" y2="190" stroke="#67e8f9" stroke-width="1" opacity="0.3"/>
        <text x="20" y="380" fill="#e4e4e7" font-family="sans-serif" font-size="14" font-weight="600">Raindrop on Pink Lotus | தாமரை மீது மணித்துளி</text>
      </svg>
    `)
  },
  {
    id: "sample-ocean",
    name: "Waves and Sunset (கடல் அலை அந்தி)",
    theme: "Yearning & Horizon",
    dominantColor: "#f43f5e",
    thinai: "Neythal",
    src: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
        <defs>
          <linearGradient id="skySunset" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#4c0519"/>
            <stop offset="40%" stop-color="#e11d48"/>
            <stop offset="70%" stop-color="#fb923c"/>
            <stop offset="100%" stop-color="#fef08a"/>
          </linearGradient>
          <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#0f172a"/>
            <stop offset="100%" stop-color="#1e293b"/>
          </linearGradient>
        </defs>
        <rect width="600" height="250" fill="url(#skySunset)"/>
        <circle cx="300" cy="240" r="60" fill="#fff176"/>
        <rect y="250" width="600" height="150" fill="url(#sea)"/>
        <!-- Golden path on water -->
        <polygon points="280,250 320,250 390,400 210,400" fill="#f59e0b" opacity="0.35"/>
        <!-- Waves curves -->
        <path d="M 0,270 Q 150,260 300,275 Q 450,290 600,270" stroke="#fcd34d" stroke-width="2" fill="none" opacity="0.5"/>
        <path d="M 0,310 Q 150,330 300,315 Q 450,300 600,320" stroke="#cbd5e1" stroke-width="1.5" fill="none" opacity="0.4"/>
        <!-- Solitary Catamaran boat silhouette -->
        <path d="M 420,248 L 470,248 L 460,256 L 430,256 Z" fill="#09090b"/>
        <line x1="445" y1="248" x2="445" y2="230" stroke="#09090b" stroke-width="2"/>
        <polygon points="445,232 460,242 445,244" fill="#18181b"/>
        <text x="20" y="380" fill="#e4e4e7" font-family="sans-serif" font-size="14" font-weight="600">Neythal Sunset at Shore | நெய்தல் அந்தி அலை</text>
      </svg>
    `)
  }
];
