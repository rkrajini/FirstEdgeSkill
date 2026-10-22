#!/usr/bin/env python3
"""
Packaging and Validation Script for Google AI Edge Gallery Skills
Skill: Bilingual Photo Poet (இருமொழி புகைப்பட கவிஞர்)
Compatible with: Google AI Edge Gallery, Gemma Models (LiteRT-LM)
"""

import os
import sys
import zipfile
import shutil

SKILL_NAME = "bilingual-photo-poet"
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

REQUIRED_FILES = [
    "SKILL.md",
    os.path.join("references", "sangam-thinai.md"),
    os.path.join("references", "bharathiyar-modern.md"),
    os.path.join("references", "thirukkural-meter.md"),
    os.path.join("references", "haiku-nature.md"),
    os.path.join("scripts", "index.html"),
    os.path.join("scripts", "styles.css"),
    os.path.join("scripts", "app.js"),
    os.path.join("scripts", "references-data.js"),
]

def validate_skill():
    print(f"[*] Validating Google AI Edge Gallery Skill: '{SKILL_NAME}'...")
    missing = []
    for rel_path in REQUIRED_FILES:
        full_path = os.path.join(BASE_DIR, rel_path)
        if not os.path.exists(full_path):
            missing.append(rel_path)
    
    if missing:
        print(f"[!] Error: Missing required skill files:\n" + "\n".join(f"  - {f}" for f in missing))
        return False

    # Validate SKILL.md Frontmatter
    skill_md_path = os.path.join(BASE_DIR, "SKILL.md")
    with open(skill_md_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    if not (content.startswith("---") and "name:" in content and "description:" in content):
        print("[!] Error: SKILL.md missing valid YAML frontmatter (name, description required).")
        return False

    print("  [OK] SKILL.md format and frontmatter verified.")
    print("  [OK] Reference materials verified (Sangam, Bharathiyar, Thirukkural, Haiku).")
    print("  [OK] Webview UI scripts verified.")
    return True

def package_skill():
    if not validate_skill():
        sys.exit(1)

    export_dir = os.path.join(BASE_DIR, "dist", SKILL_NAME)
    zip_path = os.path.join(BASE_DIR, "dist", f"{SKILL_NAME}-skill.zip")

    # Clean and recreate export directory
    if os.path.exists(os.path.join(BASE_DIR, "dist")):
        shutil.rmtree(os.path.join(BASE_DIR, "dist"))
    os.makedirs(export_dir, exist_ok=True)

    # Copy files
    shutil.copy2(os.path.join(BASE_DIR, "SKILL.md"), os.path.join(export_dir, "SKILL.md"))
    
    # Copy references
    shutil.copytree(os.path.join(BASE_DIR, "references"), os.path.join(export_dir, "references"))
    
    # Copy scripts
    shutil.copytree(os.path.join(BASE_DIR, "scripts"), os.path.join(export_dir, "scripts"))

    # Also add .nojekyll for GitHub Pages hosting compatibility
    with open(os.path.join(export_dir, ".nojekyll"), "w") as f:
        pass

    # Build ZIP package
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(export_dir):
            for file in files:
                abs_file = os.path.join(root, file)
                rel_path = os.path.relpath(abs_file, os.path.join(BASE_DIR, "dist"))
                zipf.write(abs_file, rel_path)

    zip_size_kb = os.path.getsize(zip_path) / 1024

    if hasattr(sys.stdout, 'reconfigure'):
        try:
            sys.stdout.reconfigure(encoding='utf-8')
        except Exception:
            pass

    print("\n=======================================================")
    print("[SUCCESS] Skill Package Built for Google AI Edge Gallery!")
    print("=======================================================")
    print(f"Output ZIP: {zip_path} ({zip_size_kb:.1f} KB)")
    print(f"Folder:     {export_dir}")
    print("\nNext Steps to add to Google AI Edge Gallery:")
    print("1. Push to your Android Device storage via ADB:")
    print(f"   adb push \"{export_dir}\" /sdcard/Download/")
    print("\n2. In the Google AI Edge Gallery App on your phone:")
    print("   - Open 'Agent Skills' and select your downloaded Gemma model.")
    print("   - Tap the 'Skills' chip -> Tap '(+)' -> 'Import local skill'.")
    print(f"   - Select the '{SKILL_NAME}' folder from your Download directory.")
    print("=======================================================\n")

if __name__ == "__main__":
    package_skill()
