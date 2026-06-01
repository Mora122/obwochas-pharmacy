"""Merge recorded video with voiceover audio for investor pitch"""
import cv2
import numpy as np
import subprocess
import os
import json

VIDEO_IN = r'C:\Users\Administrator\.openclaw\workspace\goodlife-replica\obwocha_pitch_long.mp4'
AUDIO_IN = r'C:\Users\Administrator\.openclaw\workspace\goodlife-replica\voiceover.wav'
VIDEO_EXT = r'C:\Users\Administrator\.openclaw\workspace\goodlife-replica\obwocha_pitch_extended.mp4'
VIDEO_FINAL = r'C:\Users\Administrator\.openclaw\workspace\goodlife-replica\obwocha_investor_pitch.mp4'

# Get audio duration
result = subprocess.run([
    'ffprobe', '-v', 'error', '-show_entries', 'format=duration',
    '-of', 'json', AUDIO_IN
], capture_output=True, text=True)
audio_dur = float(json.loads(result.stdout)['format']['duration'])
print(f'Audio duration: {audio_dur:.1f}s')

# Get video info
result = subprocess.run([
    'ffprobe', '-v', 'error', '-select_streams', 'v:0',
    '-show_entries', 'stream=r_frame_rate,width,height,nb_frames',
    '-of', 'json', VIDEO_IN
], capture_output=True, text=True)
vinfo = json.loads(result.stdout)['streams'][0]
v_w = vinfo['width']
v_h = vinfo['height']
num_f = int(vinfo['nb_frames'])
# Calculate fps
rr = vinfo['r_frame_rate']
num, den = map(int, rr.split('/'))
fps = num / den
vid_dur = num_f / fps
print(f'Video: {v_w}x{v_h}, {fps}fps, {num_f}frames ({vid_dur:.1f}s)')

# Extend video to match audio duration
target_frames = int(audio_dur * fps)
extra_frames = target_frames - num_f
print(f'Extending by {extra_frames} frames to {target_frames} total ({audio_dur:.1f}s)')

cap = cv2.VideoCapture(VIDEO_IN)
fourcc = cv2.VideoWriter_fourcc(*'mp4v')
out = cv2.VideoWriter(VIDEO_EXT, fourcc, fps, (v_w, v_h))

# Write all original frames
last_frame = None
for i in range(num_f):
    ret, frame = cap.read()
    if ret:
        last_frame = frame.copy()
        out.write(frame)

# Hold last frame for remaining duration
if last_frame is not None and extra_frames > 0:
    for i in range(extra_frames):
        out.write(last_frame)

cap.release()
out.release()
print(f'Extended video written: {VIDEO_EXT}')

# Merge audio into extended video
subprocess.run([
    'ffmpeg', '-y',
    '-i', VIDEO_EXT,
    '-i', AUDIO_IN,
    '-c:v', 'libx264',
    '-c:a', 'aac',
    '-shortest',
    '-movflags', '+faststart',
    VIDEO_FINAL
], check=True, capture_output=True)

final_sz = os.path.getsize(VIDEO_FINAL)
print(f'\n✅ FINAL VIDEO: {VIDEO_FINAL}')
print(f'   Size: {final_sz/1024:.0f} KB ({final_sz/1024/1024:.1f} MB)')
print(f'   Duration: {audio_dur:.1f}s video + voiceover')
