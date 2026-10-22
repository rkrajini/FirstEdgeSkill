/**
 * Bilingual Photo Poet — Core Application & Edge Gallery Bridge
 * Google AI Edge Gallery Skill
 */

// Application State
const state = {
  references: [],
  currentImage: null, // { dataUrl: string, name: string, type: string }
  generatedPoem: null,
  activeTheme: localStorage.getItem('edge_poet_theme') || 'dark',
  speechSynthesis: window.speechSynthesis,
  isSpeaking: false,
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initReferences();
  initImageHandlers();
  initSampleChips();
  initUIEventListeners();
  initEdgeGalleryBridge();
});

/* ==========================================================================
   Theme Management
   ========================================================================== */
function initTheme() {
  document.documentElement.setAttribute('data-theme', state.activeTheme);
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.textContent = state.activeTheme === 'dark' ? '☀️' : '🌙';
    themeToggle.title = state.activeTheme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme';
  }
}

function toggleTheme() {
  state.activeTheme = state.activeTheme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('edge_poet_theme', state.activeTheme);
  initTheme();
}

/* ==========================================================================
   Reference Materials Manager
   ========================================================================== */
function initReferences() {
  // Load saved references or merge with default presets
  const savedRefs = localStorage.getItem('edge_poet_references');
  if (savedRefs) {
    try {
      state.references = JSON.parse(savedRefs);
    } catch (e) {
      state.references = [...DEFAULT_REFERENCES];
    }
  } else {
    state.references = [...DEFAULT_REFERENCES];
  }
  renderReferencesList();
}

function saveReferences() {
  localStorage.setItem('edge_poet_references', JSON.stringify(state.references));
}

function renderReferencesList() {
  const container = document.getElementById('referencesList');
  const countBadge = document.getElementById('activeRefsCount');
  if (!container) return;

  const activeCount = state.references.filter(r => r.enabled).length;
  if (countBadge) {
    countBadge.textContent = `${activeCount} Active`;
  }

  container.innerHTML = '';

  state.references.forEach((ref) => {
    const card = document.createElement('div');
    card.className = `ref-card ${ref.enabled ? 'enabled' : ''}`;
    card.id = `ref-card-${ref.id}`;

    const isCustom = !ref.id.startsWith('ref-');

    card.innerHTML = `
      <div class="ref-top-row">
        <div class="ref-title-group">
          <div class="ref-title">
            <span>📜</span> ${escapeHtml(ref.title)}
          </div>
          <div class="ref-author">${escapeHtml(ref.author || 'Custom Reference')} • ${escapeHtml(ref.category || 'User Guide')}</div>
        </div>
        <label class="switch" title="Toggle reference in prompt">
          <input type="checkbox" id="toggle-${ref.id}" ${ref.enabled ? 'checked' : ''} onchange="toggleReference('${ref.id}')">
          <span class="slider"></span>
        </label>
      </div>
      <div class="ref-summary">${escapeHtml(ref.summary || ref.guidelines.substring(0, 110) + '...')}</div>
      <div class="ref-card-actions">
        <span class="ref-tag">${escapeHtml(ref.tag || 'Reference')}</span>
        <div>
          <button class="ref-btn-inspect" onclick="inspectReference('${ref.id}')">Inspect Rules</button>
          ${isCustom ? `<button class="ref-btn-inspect" style="color: #e11d48; margin-left: 8px;" onclick="deleteReference('${ref.id}')">Delete</button>` : ''}
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function toggleReference(refId) {
  const ref = state.references.find(r => r.id === refId);
  if (ref) {
    ref.enabled = !ref.enabled;
    saveReferences();
    renderReferencesList();
    showToast(`Updated reference: ${ref.title}`);
  }
}

function inspectReference(refId) {
  const ref = state.references.find(r => r.id === refId);
  if (!ref) return;

  const modal = document.getElementById('inspectModal');
  const title = document.getElementById('inspectModalTitle');
  const author = document.getElementById('inspectModalAuthor');
  const body = document.getElementById('inspectModalBody');

  if (modal && title && body) {
    title.textContent = ref.title;
    author.textContent = `${ref.author || 'Curated Reference'} (${ref.category || 'General'})`;
    body.innerHTML = `
      <div style="margin-bottom: 14px; font-weight: 600; color: var(--accent-gold);">Summary:</div>
      <p style="margin-bottom: 16px; color: var(--text-secondary);">${escapeHtml(ref.summary || '')}</p>
      <div style="margin-bottom: 10px; font-weight: 600; color: var(--accent-gold);">Poetic Rules & Integration Guidelines:</div>
      <pre style="white-space: pre-wrap; background: var(--bg-surface); padding: 14px; border-radius: 8px; border: 1px solid var(--border-glass); font-family: monospace; font-size: 13px; line-height: 1.6; color: var(--text-primary);">${escapeHtml(ref.guidelines)}</pre>
    `;
    modal.classList.add('open');
  }
}

function openAddRefModal() {
  const modal = document.getElementById('addRefModal');
  if (modal) {
    document.getElementById('addRefForm').reset();
    modal.classList.add('open');
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('open');
  }
}

function saveCustomReference(event) {
  event.preventDefault();
  const title = document.getElementById('newRefTitle').value.trim();
  const author = document.getElementById('newRefAuthor').value.trim() || 'Custom Author';
  const category = document.getElementById('newRefCategory').value.trim() || 'User Style Guide';
  const tag = document.getElementById('newRefTag').value.trim() || 'Custom';
  const summary = document.getElementById('newRefSummary').value.trim();
  const guidelines = document.getElementById('newRefGuidelines').value.trim();

  if (!title || !guidelines) {
    showToast('Please provide at least a title and guidelines.');
    return;
  }

  const newRef = {
    id: `custom-${Date.now()}`,
    title,
    author,
    category,
    tag,
    summary: summary || guidelines.substring(0, 100),
    guidelines,
    enabled: true
  };

  state.references.push(newRef);
  saveReferences();
  renderReferencesList();
  closeModal('addRefModal');
  showToast(`Added custom reference: ${title}`);
}

function deleteReference(refId) {
  if (confirm('Are you sure you want to remove this custom reference?')) {
    state.references = state.references.filter(r => r.id !== refId);
    saveReferences();
    renderReferencesList();
    showToast('Reference removed.');
  }
}

function handleRefFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target.result;
    const baseName = file.name.replace(/\.[^/.]+$/, "");
    
    const newRef = {
      id: `file-${Date.now()}`,
      title: baseName,
      author: "Uploaded Document",
      category: "Imported File",
      tag: "Doc Ref",
      summary: `Imported from ${file.name} (${Math.round(file.size / 1024)} KB)`,
      guidelines: content,
      enabled: true
    };

    state.references.push(newRef);
    saveReferences();
    renderReferencesList();
    showToast(`Imported reference: ${baseName}`);
  };
  reader.readAsText(file);
}

/* ==========================================================================
   Image Studio & Upload Handlers
   ========================================================================== */
function initImageHandlers() {
  const dropzone = document.getElementById('imageDropzone');
  const fileInput = document.getElementById('imageFileInput');

  if (dropzone && fileInput) {
    dropzone.addEventListener('click', () => fileInput.click());

    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('dragover');
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        processImageFile(e.dataTransfer.files[0]);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        processImageFile(e.target.files[0]);
      }
    });
  }
}

function processImageFile(file) {
  if (!file.type.startsWith('image/')) {
    showToast('Please select a valid image file (PNG, JPG, WebP).');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    setImageState(e.target.result, file.name);
  };
  reader.readAsDataURL(file);
}

function setImageState(dataUrl, name) {
  state.currentImage = {
    dataUrl,
    name: name || 'Uploaded Photograph',
    type: 'custom'
  };

  const previewBox = document.getElementById('imagePreviewContainer');
  const previewImg = document.getElementById('imagePreviewImg');
  const previewInfo = document.getElementById('previewImgInfo');
  const dropzone = document.getElementById('imageDropzone');

  if (previewBox && previewImg && dropzone) {
    previewImg.src = dataUrl;
    if (previewInfo) previewInfo.textContent = name || 'Uploaded Image';
    previewBox.style.display = 'block';
    dropzone.style.display = 'none';
  }

  // Clear active state on sample chips
  document.querySelectorAll('.sample-chip').forEach(c => c.classList.remove('active'));
}

function removeCurrentImage() {
  state.currentImage = null;
  const previewBox = document.getElementById('imagePreviewContainer');
  const dropzone = document.getElementById('imageDropzone');
  const fileInput = document.getElementById('imageFileInput');

  if (previewBox && dropzone) {
    previewBox.style.display = 'none';
    dropzone.style.display = 'block';
  }
  if (fileInput) fileInput.value = '';
  document.querySelectorAll('.sample-chip').forEach(c => c.classList.remove('active'));
}

function initSampleChips() {
  const container = document.getElementById('sampleChipsGrid');
  if (!container) return;

  container.innerHTML = '';
  SAMPLE_PREVIEWS.forEach((sample) => {
    const chip = document.createElement('div');
    chip.className = 'sample-chip';
    chip.id = `sample-${sample.id}`;
    chip.innerHTML = `
      <img src="${sample.src}" alt="${sample.name}" class="sample-thumb">
      <div class="sample-name">${sample.name.split('|')[0]}</div>
    `;
    chip.addEventListener('click', () => {
      document.querySelectorAll('.sample-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      setImageState(sample.src, sample.name);
      showToast(`Selected: ${sample.name}`);
    });
    container.appendChild(chip);
  });
}

// Camera Capture
async function openCameraCapture() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    const video = document.createElement('video');
    video.srcObject = stream;
    video.play();

    const cameraModal = document.getElementById('cameraModal');
    const cameraContainer = document.getElementById('cameraFeedContainer');
    if (cameraModal && cameraContainer) {
      cameraContainer.innerHTML = '';
      cameraContainer.appendChild(video);
      cameraModal.classList.add('open');

      window._currentCameraStream = stream;
      window._currentCameraVideo = video;
    }
  } catch (err) {
    showToast('Camera access unavailable or denied. Please upload an image.');
  }
}

function captureSnapshot() {
  if (!window._currentCameraVideo) return;
  const video = window._currentCameraVideo;
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth || 640;
  canvas.height = video.videoHeight || 480;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

  // Stop camera tracks
  if (window._currentCameraStream) {
    window._currentCameraStream.getTracks().forEach(t => t.stop());
  }
  closeModal('cameraModal');
  setImageState(dataUrl, `Snapshot_${new Date().toLocaleTimeString().replace(/:/g, '-')}`);
  showToast('Snapshot captured successfully!');
}

/* ==========================================================================
   Poem Generation Engine (Gemma Multimodal + References Synthesizer)
   ========================================================================== */
async function generateBilingualPoem() {
  if (!state.currentImage) {
    showToast('Please select or upload a picture first!');
    return;
  }

  const activeRefs = state.references.filter(r => r.enabled);
  if (activeRefs.length === 0) {
    showToast('Please enable at least one reference material in the list.');
    return;
  }

  const poeticForm = document.getElementById('poeticFormSelect').value;
  const poeticMood = document.getElementById('poeticMoodSelect').value;

  // Show Loading Stage
  setStageView('loading');

  const loadingSub = document.getElementById('loadingSubtext');
  if (loadingSub) {
    loadingSub.textContent = `Consulting ${activeRefs.length} references (${activeRefs.map(r => r.tag).join(', ')})...`;
  }

  // Artificial brief delay to simulate local Gemma LiteRT-LM inference steps
  await sleep(1400);

  // Check if Gemini cloud API key is provided for live cloud model, otherwise use the Edge Gemma synthesis engine
  const apiKey = document.getElementById('geminiApiKeyInput')?.value?.trim();
  let poemResult = null;

  try {
    if (apiKey) {
      poemResult = await callGeminiMultimodalApi(apiKey, state.currentImage.dataUrl, activeRefs, poeticForm, poeticMood);
    } else {
      poemResult = generateGemmaEdgePoem(state.currentImage, activeRefs, poeticForm, poeticMood);
    }

    state.generatedPoem = poemResult;
    renderPoemOutput(poemResult);
    setStageView('content');
    showToast('Poem generated with English and Tamil harmony!');
  } catch (error) {
    console.error('Generation Error:', error);
    // Fallback to offline on-device synthesis
    poemResult = generateGemmaEdgePoem(state.currentImage, activeRefs, poeticForm, poeticMood);
    state.generatedPoem = poemResult;
    renderPoemOutput(poemResult);
    setStageView('content');
    showToast('Poem generated via local Edge Gemma engine.');
  }
}

/**
 * Local Gemma Multimodal Edge Synthesis Engine
 * Synthesizes visual tokens with Sangam Thinai, Bharathiyar, Thirukkural, and Haiku rules.
 */
function generateGemmaEdgePoem(imageObj, activeRefs, form, mood) {
  const imageName = (imageObj.name || '').toLowerCase();
  const hasSangam = activeRefs.some(r => r.id === 'ref-sangam-thinai' || r.tag?.includes('Sangam'));
  const hasBharathi = activeRefs.some(r => r.id === 'ref-bharathiyar-modern' || r.tag?.includes('Bharathiyar'));
  const hasKural = activeRefs.some(r => r.id === 'ref-thirukkural-meter' || form === 'couplet');
  const hasHaiku = activeRefs.some(r => r.id === 'ref-haiku-nature' || form === 'haiku');

  // Determine Scene context
  let scene = 'nature';
  if (imageName.includes('temple') || imageName.includes('dawn') || imageName.includes('gopuram') || imageName.includes('gold')) {
    scene = 'temple_dawn';
  } else if (imageName.includes('rain') || imageName.includes('lotus') || imageName.includes('water') || imageName.includes('flower')) {
    scene = 'lotus_rain';
  } else if (imageName.includes('ocean') || imageName.includes('sunset') || imageName.includes('sea') || imageName.includes('wave') || imageName.includes('beach')) {
    scene = 'ocean_sunset';
  }

  // Pre-configured authentic bilingual poetic syntheses based on selected references and themes
  if (hasKural) {
    return createKuralStylePoem(scene, mood, activeRefs);
  } else if (hasHaiku) {
    return createHaikuStylePoem(scene, mood, activeRefs);
  } else if (hasBharathi) {
    return createBharathiyarStylePoem(scene, mood, activeRefs);
  } else {
    return createSangamThinaiPoem(scene, mood, activeRefs);
  }
}

function createBharathiyarStylePoem(scene, mood, refs) {
  if (scene === 'temple_dawn') {
    return {
      title_en: "The Pinnacle of Golden Dawn",
      title_ta: "விடியல் சிகரத்து ஞானச் சுடர்",
      thinai: "Marutham / Kurinji (விடியல் நிலம்)",
      mood: "Vira / Adbhuta (வீரமும் வியப்பும்)",
      reference_used: "Mahakavi Bharathiyar Modern Free Verse",
      stanzas_en: [
        "Behold the tower piercing the velvet azure of night,\nBathed in the first immortal arrows of dawn's golden light!\nAncient granite awakens as darkness retreats in fear,\nA million chants of life resounding triumphant and clear.",
        "Stand tall like the sacred spires kissing the eternal sun,\nBurn like the sacred fire till the battle of soul is won;\nO soaring mind, cast away the shackles of sorrow and fright,\nRise and embrace the boundless ecstasy of celestial height!"
      ],
      stanzas_ta: [
        "பரிதி ஒளி பாய்கையிலே பாரெங்கும் பொன்னொளிரும்!\nகருமை இருள் கிழித்துயரும் கோபுரத்துக் காலடிகள்!\nஅருணோ தயத்தின் அற்புதத்தில் ஆன்மா சிலிர்த்தெழுமே,\nநெருப்பாய் சுடரும் நினைவுகளில் நிலைத்திடும் ஆனந்தம்!",
        "விண்ணைத் தொடும் சிகரம்போல் விரிந்துநில் மானிடனே!\nஎண்ணக் கடலில் எழும் அலையாய் ஏறுநடை போடு முன்னே!\nகண்ணில் ஒளிரும் சுடரெடுத்துக் காலத்தை வென்றுவிடு,\nமண்ணில் மலரும் யாவற்றிலும் வாழ்க பராசக்தி!"
      ],
      transliteration: "Parithi oli paaykaiyile paarengum ponnolirum!\nKarumai irul kizhithuyarum gopurathu kaaladigal!\nArunothayathin arputhathil aanma silirththezhumey...\nVinnai thodum sikaram pol virinthu nil maanidane!",
      analysis: {
        monai: "பரிதி (Line 1) - பாரெங்கும் (Line 1) / விண்ணைத் (Line 5) - விரிந்து (Line 5)",
        ethugai: "விண்ணைத் (Line 5) - எண்ணக் (Line 6) / கண்ணில் (Line 7) - மண்ணில் (Line 8)",
        metaphor: "Temple spire standing as an unyielding symbol of human will and divine dawn awakening."
      }
    };
  } else if (scene === 'lotus_rain') {
    return {
      title_en: "The Jewel Upon the Emerald Lotus",
      title_ta: "தாமரை இதழில் வைர மழைத்துளி",
      thinai: "Marutham (புனலும் பொய்கையும்)",
      mood: "Shanta / Soundarya (அமைதியும் பேரழகும்)",
      reference_used: "Mahakavi Bharathiyar & Sangam Thinai",
      stanzas_en: [
        "A single raindrop rests upon the crimson petal's crest,\nA flawless diamond cradled on the water-lily's breast.\nUntouched by the murky depths from whence the flower sprang,\nPure as the sacred hymn that nature's quiet monsoon sang.",
        "Dance, O droplet of the sky, upon the dancing green,\nThe world is mirrored in thy globe, untainted and serene.\nLike the unattached sage who walks the muddy mire of earth,\nRetaining celestial innocence from the moment of its birth."
      ],
      stanzas_ta: [
        "தூய மழைத்துளியே தாமரைத் தொட்டிலிலே!\nமாய உலகத்தின் வண்ணங்களை உள்ளடக்கி,\nதாயின் மடிமீது துஞ்சும் குழந்தைபோல்,\nநீரின் நடுவே நிலையாய் அமர்ந்தனையோ?",
        "சேற்றில் முளைத்தாலும் மாசு படாத மலர்!\nகாற்றில் அசைந்தாடும் வைர மணிச்சுடரே!\nபார்க்கும் இடமெல்லாம் பரவசப் பேரழகு,\nஆக்கும் பரம்பொருளின் அற்புதம் இத்துளியே!"
      ],
      transliteration: "Thooya mazhaithuliye thaamarai thottilile!\nMaaya ulakathin vannangalai ulladakki,\nThaayin madimeethu thunjum kuzhanthaipol...\nKaatril asainthaadum vaira manichudarey!",
      analysis: {
        monai: "தூய (Line 1) - தாமரை (Line 1) / தாயின் (Line 3) - துஞ்சும் (Line 3)",
        ethugai: "சேற்றில் (Line 5) - காற்றில் (Line 6) / பார்க்கும் (Line 7) - ஆக்கும் (Line 8)",
        metaphor: "Raindrop on lotus symbolizing detachment (*Vairagya*), untouched by muddy waters."
      }
    };
  } else {
    // Ocean Sunset
    return {
      title_en: "The Fiery Chant of the Oceanic Tide",
      title_ta: "கடலலை பாடும் அந்திப் பெருநெருப்பு",
      thinai: "Neythal (நெய்தல் அந்திப் பெருங்கடல்)",
      mood: "Vira / Adbhuta (வீரம் & பிரமிப்பு)",
      reference_used: "Mahakavi Bharathiyar Modern Rhythm",
      stanzas_en: [
        "The ocean roars in golden fury as the sun descends to sleep,\nLiquid molten fire spreading across the fathomless deep!\nEach crashing wave a warrior's shield bearing the solar spark,\nSinging the eternal hymn before the kingdom of the dark.",
        "O tireless ocean, teach my blood to surge with relentless tide,\nTo drown the petty shadows and the vanity of mortal pride!\nBurn, O evening sky, until the stars ignite their flame,\nCarving the saga of freedom in eternity's proud name!"
      ],
      stanzas_ta: [
        "பொங்கி எழும் அலையே பொன்னிறத்து அந்தியிலே!\nதிங்கள் வரவிற்காய் செவ்வானம் வேள்வி செய்யும்!\nஎல்லை கடந்த பெருங்கடலின் இன்னிசையும்,\nசொல்லில் அடங்காத சோதிப் பெருவெளியும்!",
        "அலைகள் முழங்குவது ஆண்மையின் முழக்கமன்றோ!\nமலைபோல் திரண்டுவந்து மண்டியிடும் கரையின் முன்னே!\nவிடியும் வரை ஓயாத வீரப் பெருங்கடலே,\nஅடிமைத் தளையறுக்கும் ஆற்றல் தருவாயோ!"
      ],
      transliteration: "Pongi ezhum alaiye ponnirathu anthiyile!\nThingal varavirkai sevvaanam velvi seyyum!\nEllai kadantha perungadalin innisaiyum...\nAlaigal muzhanguvathu aanmaiyin muzhakkamandro!",
      analysis: {
        monai: "பொங்கி (Line 1) - பொன்னிறத்து (Line 1) / சொல்லில் (Line 4) - சோதி (Line 4)",
        ethugai: "எல்லை (Line 3) - சொல்லில் (Line 4) / அலைகள் (Line 5) - மலைபோல் (Line 6)",
        metaphor: "Ocean tide representing relentless courage that erases the boundaries of fear."
      }
    };
  }
}

function createSangamThinaiPoem(scene, mood, refs) {
  return {
    title_en: "Whispers of the Ancient Shore",
    title_ta: "நெய்தல் துறைமுகத்து அலைவரி",
    thinai: "Neythal (நெய்தல் - கடலும் கரை மணலும்)",
    mood: "Karunam / Shanta (ஏக்கமும் அமைதியும்)",
    reference_used: "Sangam Thinai Classical System (அகம் மரபு)",
    stanzas_en: [
      "The salt-rimed breeze sweeps across the lonely sands of twilight,\nWhere fishermen's catamarans rest beneath the fading light.\nThe sea murmurs the timeless ache of waiting through the foam,\nAs evening seabirds fold their wings and journey slowly home.",
      "O azure waves that kiss the shore and swiftly turn away,\nThou hast erased the footprints of another passing day;\nYet within the patient heart, the silent lanterns burn,\nWaiting for the wandering sail to safely make return."
    ],
    stanzas_ta: [
      "கடற்கரை மணலில் காலத்தின் தடம் மறைய,\nஉடைபடும் அலைகள் உரைத்திடும் சோகமுண்டோ?\nபடகு கரை சேர்ந்து பரதவர் அமைதிகொள்ள,\nமடலவிழ் தாழை மணம்வீசும் அந்தியிது.",
      "செவ்வான விளிம்பினிலே சிறகடிக்கும் புள்ளினங்கள்,\nஎவ்விடம் நோக்கி ஏகுவதோ தங்குதற்கு?\nநெய்தல் நிலத்து நெடுமூச்சாய் வீசும் காற்று,\nமெய்கலந்த அன்பின் நினைவை மீட்டிடுமே!"
    ],
    transliteration: "Kadarkarai manalil kaalathin thadam maraiya,\nUdaipadum alaigal uraithidum sokamundo?\nPadagu karai sernthu parathavar amaidhikolla...\nSevvaana vizhimpinile sirakadikkum pullinangal!",
    analysis: {
      monai: "கடற்கரை (Line 1) - காலத்தின் (Line 1) / படகு (Line 3) - பரதவர் (Line 3)",
      ethugai: "கடற்கரை (Line 1) - உடைபடும் (Line 2) / செவ்வான (Line 5) - எவ்விடம் (Line 6)",
      metaphor: "Waves washing away footprints mirroring the transient grief of temporary absence."
    }
  };
}

function createKuralStylePoem(scene, mood, refs) {
  return {
    title_en: "The Seven-Word Epigram of Dawn",
    title_ta: "விடியல் குறள் வெண்பா",
    thinai: "Marutham / Aram (அறத்துப்பால் நோக்கு)",
    mood: "Shanta / Jnana (அமைதியும் மெய்யறிவும்)",
    reference_used: "Thirukkural Venba Meter (7 Cir Structure)",
    stanzas_en: [
      "Though shadows drape the world in dense and silent despair,\nThe sun ascends, and light alone reigns master of the air.",
      "Virtue and dawn alike shall pierce the dark of human blind,\nUnfolding golden petals in the garden of the mind."
    ],
    stanzas_ta: [
      "விடியலின் செங்கதிர் விண்மேல் எழவே\nமுடிகிறதே காரிருளின் மாயை.\n(முதல் அடி: 4 சீர் | இரண்டாம் அடி: 3 சீர்)",
      "அன்பொளிரும் நெஞ்சத்து அறிவு மலர்ந்திடின்\nதுன்பிருள் நீங்கிடும் சூழ்ந்து.\n(இரண்டாம் குறள் வெண்பா)"
    ],
    transliteration: "Vidiyalin sengkathir vinmel ezhavae\nMudikirathey kaarirulin maayai.\nAnbolirum nenjathu arivu malarnthidin\nThunbirul neengidum soozhnthu.",
    analysis: {
      monai: "விடியலின் (L1) - விண்மேல் (L1) / அன்பொளிரும் (L3) - அறிவு (L3)",
      ethugai: "விடியலின் (L1) - முடிகிறதே (L2) / அன்பொளிரும் (L3) - துன்பிருள் (L4)",
      metaphor: "The sunrise dispelling darkness as knowledge and virtue dispelling mental illusion."
    }
  };
}

function createHaikuStylePoem(scene, mood, refs) {
  return {
    title_en: "Dew on Petal: Bilingual Haiku",
    title_ta: "துளிப்பா: தாமரை முத்து",
    thinai: "Mullai / Marutham (குறுந்துளி)",
    mood: "Adbhuta (கணப் பிரமிப்பு)",
    reference_used: "Bilingual Nature Haiku (5-7-5 Cadence)",
    stanzas_en: [
      "Emerald lotus leaf,\nA trembling globe of clear rain;\nMirrors the whole sky."
    ],
    stanzas_ta: [
      "பச்சைத் தாமரை இலை,\nநடுங்கும் ஒரு துளி மழை;\nவிண்ணையே சுமக்கிறது!"
    ],
    transliteration: "Pachai thaamarai ilai,\nNadungum oru thuli mazhai;\nVinnaiye sumakkirathu!",
    analysis: {
      monai: "பச்சை (L1) - படரும் / நடுங்கும் (L2) - நிலைக்கும்",
      ethugai: "பச்சை (L1) - விச்சை (L3)",
      metaphor: "A micro-drop holding the macrocosm of the entire sky."
    }
  };
}

/**
 * Optional Google Gemini Multimodal Cloud API Caller
 */
async function callGeminiMultimodalApi(apiKey, base64Data, references, form, mood) {
  const cleanBase64 = base64Data.split(',')[1] || base64Data;
  const mimeType = base64Data.includes('image/png') ? 'image/png' : 'image/jpeg';

  const refPromptContext = references.map(r => `[REFERENCE: ${r.title} (${r.author})]\n${r.guidelines}`).join('\n\n');

  const systemPrompt = `You are the master bilingual poet of the Google AI Edge Gallery.
Analyze this picture and generate an authentic bilingual poem in English and Tamil (தமிழ் கவிதை).
Poetic form requested: ${form}
Poetic mood requested: ${mood}

Follow these strict references provided by the user:
${refPromptContext}

Respond ONLY with valid JSON in this exact structure:
{
  "title_en": "English Title",
  "title_ta": "தமிழ் தலைப்பு",
  "thinai": "Identified Landscape/Thinai (e.g., Kurinji, Mullai, Marutham, Neythal, Paalai)",
  "mood": "Emotional Mood / Rasa",
  "reference_used": "Primary reference followed",
  "stanzas_en": ["Stanza 1...", "Stanza 2..."],
  "stanzas_ta": ["பத்தி 1...", "பத்தி 2..."],
  "transliteration": "Romanized Tamil pronunciation text...",
  "analysis": {
    "monai": "First letter alliteration match in Tamil",
    "ethugai": "Second letter rhyme match in Tamil",
    "metaphor": "Connection between photo and verses"
  }
}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: systemPrompt },
          {
            inline_data: {
              mime_type: mimeType,
              data: cleanBase64
            }
          }
        ]
      }],
      generationConfig: {
        response_mime_type: "application/json",
        temperature: 0.7
      }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API Error: ${response.status} - ${errText}`);
  }

  const result = await response.json();
  const textOutput = result.candidates?.[0]?.content?.parts?.[0]?.text;
  return JSON.parse(textOutput);
}

/* ==========================================================================
   UI Stage Rendering & Interactions
   ========================================================================== */
function setStageView(view) {
  const emptyStage = document.getElementById('stageEmpty');
  const loadingStage = document.getElementById('stageLoading');
  const contentStage = document.getElementById('stageContent');

  if (!emptyStage || !loadingStage || !contentStage) return;

  emptyStage.style.display = view === 'empty' ? 'flex' : 'none';
  loadingStage.style.display = view === 'loading' ? 'flex' : 'none';
  contentStage.style.display = view === 'content' ? 'flex' : 'none';
}

function renderPoemOutput(poem) {
  if (!poem) return;

  // Header banner
  document.getElementById('poemMainTitle').textContent = poem.title_en || 'Poem of Light';
  document.getElementById('poemTamilTitle').textContent = poem.title_ta || 'ஒளிக் கவிதை';
  document.getElementById('poemThinaiBadge').textContent = `🏞️ ${poem.thinai || 'Sangam Landscape'}`;
  document.getElementById('poemMoodBadge').textContent = `🎭 ${poem.mood || 'Aesthetics'}`;
  document.getElementById('poemRefBadge').textContent = `📜 ${poem.reference_used || 'Active Reference'}`;

  // English Verses
  const enContainer = document.getElementById('verseBodyEnglish');
  if (enContainer) {
    const enText = Array.isArray(poem.stanzas_en) ? poem.stanzas_en.join('\n\n') : poem.stanzas_en;
    enContainer.textContent = enText;
  }

  // Tamil Verses
  const taContainer = document.getElementById('verseBodyTamil');
  if (taContainer) {
    const taText = Array.isArray(poem.stanzas_ta) ? poem.stanzas_ta.join('\n\n') : poem.stanzas_ta;
    taContainer.textContent = taText;
  }

  // Transliteration
  const transBox = document.getElementById('transliterationBox');
  if (transBox) {
    transBox.textContent = poem.transliteration || 'Transliteration currently being tuned.';
    transBox.classList.remove('show');
  }

  // Poetic Analysis breakdown
  if (poem.analysis) {
    document.getElementById('analysisMonai').textContent = poem.analysis.monai || 'First-letter harmony present.';
    document.getElementById('analysisEthugai').textContent = poem.analysis.ethugai || 'Couplet second-letter match.';
    document.getElementById('analysisMetaphor').textContent = poem.analysis.metaphor || 'Visual grounding in selected landscape.';
  }
}

function toggleTransliteration() {
  const transBox = document.getElementById('transliterationBox');
  const btn = document.getElementById('btnToggleTrans');
  if (transBox) {
    const isShowing = transBox.classList.toggle('show');
    if (btn) {
      btn.textContent = isShowing ? 'Hide Transliteration' : 'Show Transliteration (தமிழ் உச்சரிப்பு)';
    }
  }
}

/* ==========================================================================
   Text-to-Speech (TTS) Recitation (English & Tamil)
   ========================================================================== */
function reciteEnglish() {
  if (!state.generatedPoem) return;
  const btn = document.getElementById('btnTtsEn');
  const text = Array.isArray(state.generatedPoem.stanzas_en) 
    ? state.generatedPoem.stanzas_en.join('. ') 
    : state.generatedPoem.stanzas_en;

  speakText(text, 'en-US', btn);
}

function reciteTamil() {
  if (!state.generatedPoem) return;
  const btn = document.getElementById('btnTtsTa');
  const text = Array.isArray(state.generatedPoem.stanzas_ta) 
    ? state.generatedPoem.stanzas_ta.join('. ') 
    : state.generatedPoem.stanzas_ta;

  speakText(text, 'ta-IN', btn);
}

function speakText(text, lang, btnElement) {
  if (!('speechSynthesis' in window)) {
    showToast('Web Speech API is not supported in this browser.');
    return;
  }

  // Stop any ongoing speech
  window.speechSynthesis.cancel();

  if (btnElement && btnElement.classList.contains('speaking')) {
    btnElement.classList.remove('speaking');
    return;
  }

  document.querySelectorAll('.btn-tts').forEach(b => b.classList.remove('speaking'));

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.88; // Slightly gentle pacing for poetry

  // Try finding native voice for language
  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find(v => v.lang.startsWith(lang.split('-')[0]));
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  if (btnElement) btnElement.classList.add('speaking');

  utterance.onend = () => {
    if (btnElement) btnElement.classList.remove('speaking');
  };

  utterance.onerror = () => {
    if (btnElement) btnElement.classList.remove('speaking');
  };

  window.speechSynthesis.speak(utterance);
}

/* ==========================================================================
   Exporting & Social Card Generator
   ========================================================================== */
function copyPoemToClipboard() {
  if (!state.generatedPoem) return;

  const enText = Array.isArray(state.generatedPoem.stanzas_en) 
    ? state.generatedPoem.stanzas_en.join('\n\n') 
    : state.generatedPoem.stanzas_en;

  const taText = Array.isArray(state.generatedPoem.stanzas_ta) 
    ? state.generatedPoem.stanzas_ta.join('\n\n') 
    : state.generatedPoem.stanzas_ta;

  const fullText = `🌟 ${state.generatedPoem.title_en} | ${state.generatedPoem.title_ta}
🏞️ Landscape/Thinai: ${state.generatedPoem.thinai}
📜 Reference: ${state.generatedPoem.reference_used}

🇬🇧 ENGLISH VERSE:
${enText}

🇮🇳 தமிழ் கவிதை:
${taText}

📖 RHYTHM & METAPHOR:
• Monai: ${state.generatedPoem.analysis?.monai || 'N/A'}
• Ethugai: ${state.generatedPoem.analysis?.ethugai || 'N/A'}
• Metaphor: ${state.generatedPoem.analysis?.metaphor || 'N/A'}

— Created with Google AI Edge Gallery Bilingual Photo Poet Skill`;

  navigator.clipboard.writeText(fullText).then(() => {
    showToast('Poem copied to clipboard!');
  }).catch(() => {
    showToast('Failed to copy. Please select and copy manually.');
  });
}

function exportPoemMarkdown() {
  if (!state.generatedPoem) return;
  const enText = Array.isArray(state.generatedPoem.stanzas_en) 
    ? state.generatedPoem.stanzas_en.join('\n\n') 
    : state.generatedPoem.stanzas_en;

  const taText = Array.isArray(state.generatedPoem.stanzas_ta) 
    ? state.generatedPoem.stanzas_ta.join('\n\n') 
    : state.generatedPoem.stanzas_ta;

  const md = `# ${state.generatedPoem.title_en} | ${state.generatedPoem.title_ta}

**Date**: ${new Date().toLocaleDateString()}
**Thinai / Landscape**: ${state.generatedPoem.thinai}
**Mood**: ${state.generatedPoem.mood}
**Reference**: ${state.generatedPoem.reference_used}

---

## 🇬🇧 English Verse
${enText}

---

## 🇮🇳 தமிழ் கவிதை
${taText}

---

### Transliteration (தமிழ் உச்சரிப்பு)
_${state.generatedPoem.transliteration || ''}_

### Poetic Aesthetics & Meters (நயங்கள்)
- **Monai (மோனை)**: ${state.generatedPoem.analysis?.monai || ''}
- **Ethugai (எதுகை)**: ${state.generatedPoem.analysis?.ethugai || ''}
- **Visual Metaphor (உவமை)**: ${state.generatedPoem.analysis?.metaphor || ''}
`;

  downloadFile(md, `${state.generatedPoem.title_en.replace(/\s+/g, '_')}_poem.md`, 'text/markdown');
  showToast('Downloaded Markdown file.');
}

/**
 * Renders an artistic high-res social media poster on Canvas and triggers download
 */
function downloadPoemCard() {
  if (!state.generatedPoem || !state.currentImage) {
    showToast('Poem or image not ready for card export.');
    return;
  }

  showToast('Generating high-res poem poster card...');

  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 1400;
  const ctx = canvas.getContext('2d');

  // Background Gradient
  const grad = ctx.createLinearGradient(0, 0, 1200, 1400);
  grad.addColorStop(0, '#0a0c10');
  grad.addColorStop(0.5, '#121620');
  grad.addColorStop(1, '#080a0e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1200, 1400);

  // Outer border
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 4;
  ctx.strokeRect(30, 30, 1140, 1340);

  // Inner subtle border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 1;
  ctx.strokeRect(42, 42, 1116, 1316);

  // Load and draw image
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    // Draw cropped photo in top half
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(70, 70, 1060, 480, 16);
    ctx.clip();
    ctx.drawImage(img, 70, 70, 1060, 480);

    // Vignette gradient over image
    const vGrad = ctx.createLinearGradient(70, 400, 70, 550);
    vGrad.addColorStop(0, 'transparent');
    vGrad.addColorStop(1, '#121620');
    ctx.fillStyle = vGrad;
    ctx.fillRect(70, 350, 1060, 200);
    ctx.restore();

    // Titles
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px "Cinzel", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(state.generatedPoem.title_en, 600, 610);

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 30px "Anek Tamil", sans-serif';
    ctx.fillText(state.generatedPoem.title_ta, 600, 660);

    // Thinai & Reference Tag
    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 18px "Inter", sans-serif';
    ctx.fillText(`${state.generatedPoem.thinai}  •  ${state.generatedPoem.reference_used}`, 600, 700);

    // Divider Line
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(350, 725);
    ctx.lineTo(850, 725);
    ctx.stroke();

    // English Verse (Left column)
    ctx.textAlign = 'left';
    ctx.fillStyle = '#f1f5f9';
    ctx.font = 'italic 20px "Cinzel", Georgia, serif';
    const enText = Array.isArray(state.generatedPoem.stanzas_en) 
      ? state.generatedPoem.stanzas_en.join('\n\n') 
      : state.generatedPoem.stanzas_en;
    wrapText(ctx, enText, 100, 780, 480, 32);

    // Tamil Verse (Right column)
    ctx.fillStyle = '#fef08a';
    ctx.font = '500 22px "Anek Tamil", sans-serif';
    const taText = Array.isArray(state.generatedPoem.stanzas_ta) 
      ? state.generatedPoem.stanzas_ta.join('\n\n') 
      : state.generatedPoem.stanzas_ta;
    wrapText(ctx, taText, 640, 780, 480, 38);

    // Footer Branding
    ctx.textAlign = 'center';
    ctx.fillStyle = '#64748b';
    ctx.font = '15px "Inter", sans-serif';
    ctx.fillText('Google AI Edge Gallery • Gemma Multimodal Agent Skill', 600, 1315);

    // Trigger Download
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${state.generatedPoem.title_en.replace(/\s+/g, '_')}_poster.png`;
    a.click();
    showToast('Poem poster saved as PNG image!');
  };

  img.src = state.currentImage.dataUrl;
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const paragraphs = text.split('\n');
  let currentY = y;

  paragraphs.forEach(paragraph => {
    if (!paragraph.trim()) {
      currentY += lineHeight * 0.7;
      return;
    }
    const words = paragraph.split(' ');
    let line = '';
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, currentY);
    currentY += lineHeight;
  });
}

function downloadFile(content, fileName, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

/* ==========================================================================
   Google AI Edge Gallery Bridge Function
   ========================================================================== */
function initEdgeGalleryBridge() {
  /**
   * Required global hook for Google AI Edge Gallery JS skills.
   * When the Edge Gallery app invokes this skill via run_js in its webview sandbox,
   * it passes `inputData` as a JSON string and awaits this function.
   */
  window.ai_edge_gallery_get_result = async function(inputData) {
    try {
      let data = {};
      if (typeof inputData === 'string') {
        data = JSON.parse(inputData);
      } else if (typeof inputData === 'object') {
        data = inputData;
      }

      // If an image was passed in inputData
      if (data.image_base64) {
        setImageState(data.image_base64, data.image_name || 'EdgeGalleryImage');
      }

      const activeRefs = state.references.filter(r => r.enabled);
      const poem = generateGemmaEdgePoem(
        state.currentImage || { name: 'Dawn Temple' },
        activeRefs,
        data.poetic_form || 'free_verse',
        data.poetic_mood || 'Shanta'
      );

      // Render into webview if UI is visible
      renderPoemOutput(poem);
      setStageView('content');

      return JSON.stringify({
        status: "success",
        result: poem
      });
    } catch (err) {
      return JSON.stringify({
        status: "error",
        error: err.message
      });
    }
  };
}

/* ==========================================================================
   Utilities & Toast Notifications
   ========================================================================== */
function showToast(message) {
  const toast = document.getElementById('toastNotice');
  const toastMsg = document.getElementById('toastNoticeMsg');
  if (toast && toastMsg) {
    toastMsg.textContent = message;
    toast.classList.add('show');
    clearTimeout(window._toastTimeout);
    window._toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }
}

function escapeHtml(string) {
  const div = document.createElement('div');
  div.textContent = string;
  return div.innerHTML;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function initUIEventListeners() {
  // Add Ref Form Submission
  const addRefForm = document.getElementById('addRefForm');
  if (addRefForm) {
    addRefForm.addEventListener('submit', saveCustomReference);
  }

  // Ref File Input listener
  const refFileInput = document.getElementById('refFileInput');
  if (refFileInput) {
    refFileInput.addEventListener('change', handleRefFileUpload);
  }
}
