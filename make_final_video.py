"""Recreate the full 47s investor pitch with TTS voiceover"""
import subprocess, os, pythoncom, win32com.client

video_ext = r'C:\Users\Administrator\.openclaw\workspace\goodlife-replica\obwocha_pitch_extended.mp4'
tts_wav = r'C:\Users\Administrator\.openclaw\workspace\goodlife-replica\voiceover.wav'
output = r'C:\Users\Administrator\.openclaw\workspace\goodlife-replica\obwocha_investor_pitch.mp4'

# Regenerate TTS
script = (
    "Obwocha's Pharmacy \u2014 Meru's Own Pharmacy. "
    "A full-stack e-commerce pharmacy platform serving Meru, Kenya. "
    "Founded by Robinson Obwocha, a registered Pharmaceutical Technologist "
    "with five years experience at Goodlife Pharmacy. "
    "The platform features twenty-four products with category filtering, "
    "real-time cart management, M-Pesa, Visa and cash-on-delivery payments, "
    "and same-day delivery across Meru town. "
    "We're building Kenya's next trusted pharmacy chain \u2014 "
    "starting digital, going physical. "
    "Looking for investors to help stock inventory, launch delivery logistics, "
    "and scale to two hundred products within six months. "
    "Obwocha's Pharmacy \u2014 professional healthcare, delivered."
)

pythoncom.CoInitialize()
voice = win32com.client.Dispatch('SAPI.SpVoice')
stream = win32com.client.Dispatch('SAPI.SpFileStream')
stream.Open(tts_wav, 3)
voice.AudioOutputStream = stream
voice.Speak(script)
stream.Close()
pythoncom.CoUninitialize()

sz = os.path.getsize(tts_wav)
print(f"TTS saved: {sz/1024:.0f} KB")

# Merge with video
subprocess.run([
    'ffmpeg','-y',
    '-i', video_ext,
    '-i', tts_wav,
    '-c:v', 'libx264', '-preset', 'fast', '-crf', '23',
    '-c:a', 'aac', '-b:a', '128k',
    '-shortest',
    '-movflags', '+faststart',
    output
], check=True, capture_output=True)

sz2 = os.path.getsize(output)
print(f"Final video: {sz2/1024/1024:.1f} MB at {output}")
