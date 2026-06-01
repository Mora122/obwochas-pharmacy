"""Regenerate TTS without Goodlife reference and rebuild video"""
import subprocess, os, pythoncom, win32com.client

tts_wav = r'C:\Users\Administrator\.openclaw\workspace\goodlife-replica\voiceover.wav'
video_ext = r'C:\Users\Administrator\.openclaw\workspace\goodlife-replica\obwocha_pitch_extended.mp4'
output = r'C:\Users\Administrator\.openclaw\workspace\goodlife-replica\obwocha_investor_pitch.mp4'

# New script — removed "with five years experience at Goodlife Pharmacy"
script = (
    "Obwocha's Pharmacy \u2014 Meru's Own Pharmacy. "
    "A full-stack e-commerce pharmacy platform serving Meru, Kenya. "
    "Founded by Robinson Obwocha, a registered Pharmaceutical Technologist. "
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
print("TTS regenerated: %d KB" % (sz/1024))

# Get audio duration
r = subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','json',tts_wav], capture_output=True, text=True)
import json
dur = float(json.loads(r.stdout)['format']['duration'])
print("Audio duration: %.1fs" % dur)

# Extend video to match new audio duration
import cv2, numpy as np
cap = cv2.VideoCapture(video_ext)
fps = cap.get(cv2.CAP_PROP_FPS)
num_f = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
target = int(dur * fps)
extra = target - num_f
print("Video: %dframes, extending by %d to %d (%.1fs)" % (num_f, extra, target, dur))

temp_ext = r'C:\Users\Administrator\.openclaw\workspace\goodlife-replica\temp_extended.mp4'
fourcc = cv2.VideoWriter_fourcc(*'mp4v')
out = cv2.VideoWriter(temp_ext, fourcc, fps, (w, h))
last = None
for i in range(num_f):
    ret, frame = cap.read()
    if ret:
        last = frame.copy()
        out.write(frame)
cap.release()
if last is not None and extra > 0:
    for i in range(extra):
        out.write(last)
out.release()

# Merge with new audio
subprocess.run([
    'ffmpeg','-y',
    '-i', temp_ext,
    '-i', tts_wav,
    '-c:v', 'libx264', '-preset', 'fast', '-crf', '23',
    '-c:a', 'aac', '-b:a', '128k',
    '-shortest',
    '-movflags', '+faststart',
    output
], check=True, capture_output=True)

os.remove(temp_ext)
sz2 = os.path.getsize(output)
print("Done: %.1f MB at %s" % (sz2/1024/1024, output))
