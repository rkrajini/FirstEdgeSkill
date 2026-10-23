# 🪶 Bilingual Photo Poet (இருமொழி புகைப்பட கவிஞர்)
### Google AI Edge Gallery Agent Skill & Multimodal UI for Gemma

An on-device multimodal **Agent Skill** built specifically for **Google AI Edge Gallery** and local **Gemma** models. It analyzes picture inputs, grounds visual metaphors in customizable reference materials (Sangam Thinai, Bharathiyar Modern, Thirukkural Couplets, and Haiku), and weaves synchronized bilingual poems in **English** and **Tamil (தமிழ் கவிதை)**.

---

## 🌟 Features

### 1. 🖼️ Multimodal Picture Input Studio
- **Drag & Drop / File Upload**: Supports PNG, JPG, WebP.
- **Webcam Snapshot**: Take immediate photos directly in the browser or device.
- **Instant Preset Showcase**: Includes pre-built scenes (*Dravidian Temple at Dawn*, *Monsoon Raindrop on Lotus*, *Neythal Ocean Sunset*).

### 2. 📚 Dynamic Reference Materials Manager
- **Curated Classical & Modern Presets Included**:
  - **Sangam Thinai (சங்கத் திணை)**: Maps landscapes (Kurinji, Mullai, Marutham, Neythal, Paalai) to primal emotions (*Agam* / *Puram*).
  - **Mahakavi Bharathiyar Style (பாரதியார் நடை)**: Driving lyrical tempo, passionate free verse, celebration of nature and inner liberation.
  - **Thirukkural Venba Couplet (திருக்குறள் வெண்பா)**: 7-word aphorisms (4 + 3 feet) conveying timeless philosophical insight.
  - **Bilingual Nature Haiku (துளிப்பா)**: 3-line micro-verse (5-7-5 cadence) capturing an immediate sensory spark.
- **Add Custom References**: Define your own authors, style guidelines, rhyme rules, and vocabulary in the UI.
- **File Upload for References**: Upload `.md` or `.txt` style guides directly into the active prompt context.
- **Live Toggle Switches**: Enable or disable any reference for each poetic generation.

### 3. 🇬🇧 🇮🇳 Parallel Bilingual Poetry Presentation
- **Side-by-side Dual Language Cards**: English lyrical verse and authentic Tamil script rendered with Google Font `Anek Tamil`.
- **Transliteration Toggle**: Romanized Tamil pronunciation guide (*"Vidiyalin muthal velichathil..."*) for easy recitation.
- **Poetic Meter Analysis (நயங்கள்)**:
  - **Monai (மோனை)**: First-letter alliteration breakdown.
  - **Ethugai (எதுகை)**: Second-letter rhyming breakdown.
  - **Visual Metaphor (உவமை)**: Symbolism connecting the photo to the verses.

### 4. 🔊 Dual Text-to-Speech & Poster Export
- **Audio Recitation**: Listen to English and native Tamil recitation (`ta-IN`) via the browser's Web Speech API.
- **Social Media Poster Export**: Generates a high-resolution poster card (with the photo + bilingual verses) rendered directly on HTML5 `<canvas>` and saved as PNG.
- **Clipboard & Markdown Export**: One-click copying or saving as Markdown.

---

## 📂 Project Architecture

```
FirstEdgeSkill/
├── SKILL.md                     # Google AI Edge Gallery Agent Skill definition
├── package_skill.py             # Packaging & validation script for Edge Gallery
├── references/                  # Reference literature library
│   ├── sangam-thinai.md         # 5 classical Sangam landscapes & emotional mapping
│   ├── bharathiyar-modern.md    # Bharathiyar rhythm, Monai/Ethugai, free verse
│   ├── thirukkural-meter.md     # 7-cir Kural venba couplet rules
│   └── haiku-nature.md          # 5-7-5 bilingual nature micro-verse
├── scripts/                     # Interactive UI & Edge Gallery Webview tool
│   ├── index.html               # Main UI & Edge Gallery webview entry point
│   ├── styles.css               # Modern glassmorphic styles with Anek Tamil typography
│   ├── app.js                   # Generator, TTS, poster card, and Edge Gallery bridge
│   └── references-data.js       # Offline reference presets & sample scenes
└── dist/
    ├── bilingual-photo-poet/    # Ready-to-import folder for Edge Gallery
    └── bilingual-photo-poet-skill.zip # Packaged archive for distribution
```

---

## 📲 How to Add this Skill to Google AI Edge Gallery

### Option A: Local Import via Device Storage (Recommended)
1. **Build / Verify the package**:
   ```bash
   python package_skill.py
   ```
2. **Push the skill folder to your Android device** using ADB:
   ```bash
   adb push dist/bilingual-photo-poet /sdcard/Download/
   ```
   *(Or connect via USB and drag the `bilingual-photo-poet` folder into your phone's `Download` folder)*.
3. **Open Google AI Edge Gallery on your phone**:
   - Go to the **Agent Skills** use case with your downloaded **Gemma model**.
   - Tap the **Skills** chip to open the **Skill Manager**.
   - Tap the **`(+)`** button and choose **Import local skill**.
   - Select the `bilingual-photo-poet` folder containing `SKILL.md`.
4. The skill is now active offline inside your Google AI Edge Gallery app!

### Option B: Import on iPhone or Android via URL / GitHub Pages
The GitHub Actions workflow in `.github/workflows/deploy-pages.yml` packages the skill and publishes both the browser UI and the importable skill folder.

1. Push this repository to GitHub and enable GitHub Pages under **Settings &rarr; Pages**, selecting **GitHub Actions** as the build and deployment source.
2. Wait for the **Publish skill to GitHub Pages** workflow to finish successfully.
3. In Google AI Edge Gallery, open **Agent Skills** with a model selected, tap **Skills** &rarr; **(+)** &rarr; **Load skill from URL**.
4. Enter the skill folder URL: `https://rkrajini.github.io/FirstEdgeSkill/bilingual-photo-poet`
5. If the URL is working, opening `https://rkrajini.github.io/FirstEdgeSkill/bilingual-photo-poet/SKILL.md` in Safari displays the skill instructions.

Google AI Edge Gallery is available for iPhone on iOS 17 and later. This imports the skill into the Gallery app; it does not install a separate iPhone app.

---

## 💻 Running the Web UI Locally

To launch the standalone interactive UI in your desktop or mobile browser:

```bash
cd scripts
python -m http.server 8080
```

Open **`http://localhost:8080`** in Google Chrome or Microsoft Edge.

---

## 🔌 Edge Gallery Bridge Function

Inside `scripts/app.js`, the skill implements the official Google AI Edge Gallery bridge:

```javascript
window.ai_edge_gallery_get_result = async function(inputData) {
  // Receives inputData from Gemma / Edge Gallery runtime
  // Processes image and selected references
  // Returns structured JSON with English & Tamil verses
};
```
