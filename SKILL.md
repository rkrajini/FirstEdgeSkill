---
name: bilingual-photo-poet
description: Analyzes picture inputs, combines contextual references (Sangam Thinai landscapes, Bharathiyar modern style, Thirukkural couplets, Haiku), and crafts bilingual poems in English and Tamil (கவிதை). Use when the user uploads an image, asks for poetry from pictures, or requests bilingual Tamil-English verses.
metadata:
  author: EdgeSkill
  version: "1.0.0"
  compatibility: "Google AI Edge Gallery, Gemma 2/3/4, LiteRT-LM, Webview"
---

# Bilingual Photo Poet (இருமொழி புகைப்பட கவிஞர்)

An on-device multimodal Agent Skill for the **Google AI Edge Gallery** powered by local **Gemma** models. This skill transforms visual moments into matching bilingual poetry in **English** and **Tamil (தமிழ் கவிதை)** guided by user-selected reference literature.

## Capabilities
1. **Multimodal Visual Deconstruction**: Interprets colors, lighting, emotional mood, subjects, and symbolic metaphors from picture inputs.
2. **Context-Grounded Generation**: Incorporates classical and modern reference materials (e.g., Sangam Thinai landscapes, Bharathiyar's evocative rhythm, Thirukkural couplet structure, or Haiku).
3. **Harmonious Bilingual Pairing**: Generates parallel stanzas where the English and Tamil verses reflect the same emotional resonance while honoring the intrinsic poetic conventions of both languages.
4. **Tamil Poetic Meters (யாப்பு & நயங்கள்)**: Adheres to classical Tamil poetic aesthetics like **Ethugai** (எதுகை - second letter rhyming), **Monai** (மோனை - head-rhyme / first letter alliteration), and **Iyalbu** (இயல்பு).

## References Included in this Skill
The skill loads reference materials located in `references/`:
- `references/sangam-thinai.md`: The 5 classical Sangam landscapes (Kurinji, Mullai, Marutham, Neythal, Paalai) matching nature to inner emotions.
- `references/bharathiyar-modern.md`: Mahakavi Subramania Bharati's passionate, rhythmic free verse celebrating freedom, nature, and raw devotion.
- `references/thirukkural-meter.md`: Aphoristic 7-word Kural meter (4 + 3 feet) conveying timeless philosophical truth.
- `references/haiku-nature.md`: 5-7-5 syllable imagery focusing on transient moments in nature.
- *Custom User References*: Uploaded or defined dynamically via the Skill UI.

## Execution Workflow

When the user provides an image or requests a photo poem:

1. **Inspect Image Elements**:
   - Primary subjects (e.g., sunrise, temple tower, rain on window, solitary tree, bustling street).
   - Color tones, light shadows, and predominant emotion (e.g., peace, longing, triumph, wonder).
   - Identify corresponding Sangam Thinai or poetic metaphor.

2. **Select & Ground in Reference Materials**:
   - Check which reference material is active or requested (default: Bharathiyar Modern or Sangam Thinai).
   - Extract stylistic rules: rhyme structure (Monai/Ethugai), tone, vocabulary richness.

3. **Compose Bilingual Verses**:
   - **English Verse**: 2 to 4 stanzas of lyrical, evocative imagery.
   - **Tamil Verse (தமிழ் கவிதை)**: Matching 2 to 4 stanzas in pure, expressive Tamil with proper Monai/Ethugai aesthetics and emotional cadence.
   - **Cultural Note**: A 1-2 sentence explanation of the poetic metaphor and reference connection.

4. **Webview UI Bridge**:
   When invoked via the Edge Gallery webview runtime, the bundled `scripts/index.html` tool can be executed via `run_js`. The script exports:
   ```javascript
   window.ai_edge_gallery_get_result(inputData);
   ```
   This returns the structured JSON containing:
   - `english_poem`: Full English poem text with stanzas.
   - `tamil_poem`: Full Tamil poem text in authentic script.
   - `transliteration`: Romanized pronunciation of Tamil verses.
   - `poetic_analysis`: Identified metaphors, meter, and reference notes.

## Output Format
Always present the output in this clear side-by-side or dual-block structure:

```markdown
### 🌟 [Poem Title in English] | [கவிதைத் தலைப்பு]

**Visual Mood / நிலக் குறிப்பு:** [e.g., Marutham / Dawn Tranquility]
**Reference Used / மேற்கோள்:** [e.g., Sangam Thinai / Bharathiyar Style]

#### 🇬🇧 English Verse
[Stanza 1]

[Stanza 2]

#### 🇮🇳 தமிழ் கவிதை
[பத்தி 1]

[பத்தி 2]

#### 📖 Poetic Notes & Rhythm (நயங்கள்)
- **Monai (மோனை):** [First letter alliteration examples]
- **Ethugai (எதுகை):** [Second letter rhyme examples]
- **Metaphor (உவமை):** [Connecting the image to the verses]
```
