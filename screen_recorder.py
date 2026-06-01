"""Screen recorder for Obwocha's Pharmacy investor pitch video"""
import mss
import cv2
import numpy as np
import time
import threading
import pyautogui
import subprocess

OUTPUT = r'C:\Users\Administrator\.openclaw\workspace\goodlife-replica\obwocha_pitch.mp4'
FPS = 10
DURATION = 40  # seconds total
MONITOR = 1    # primary monitor

# Resolution
with mss.mss() as sct:
    mon = sct.monitors[MONITOR]
    W, H = mon['width'], mon['height']

# Start recording in a separate thread
frames = []
recording = True

def record():
    with mss.mss() as sct:
        while recording:
            img = sct.grab(sct.monitors[MONITOR])
            frame = np.array(img)[:, :, :3]  # remove alpha
            frame = cv2.cvtColor(frame, cv2.COLOR_BGRA2BGR)
            frames.append(frame)
            time.sleep(1.0 / FPS)

print(f"Recording {W}x{H} @ {FPS}fps for {DURATION}s...")
recorder = threading.Thread(target=record, daemon=True)
recorder.start()

time.sleep(0.5)

# === NAVIGATION SEQUENCE ===

# 1. Chrome to homepage
pyautogui.hotkey('ctrl', 'l')
time.sleep(0.2)
pyautogui.write('http://localhost:8000/index.html')
time.sleep(0.1)
pyautogui.press('enter')
time.sleep(2)

# Scroll homepage
pyautogui.scroll(-12)
time.sleep(1.5)
pyautogui.scroll(12)
time.sleep(1.5)

# 2. Navigate to Shop
pyautogui.moveTo(300, 120, duration=0.3)
time.sleep(0.2)
pyautogui.click()
time.sleep(2)
pyautogui.scroll(-5)
time.sleep(1.5)

# 3. Filter by Skin Care
pyautogui.moveTo(150, 370, duration=0.3)
time.sleep(0.2)
pyautogui.click()
time.sleep(2)
pyautogui.scroll(-5)
time.sleep(1.5)

# 4. Show all products
pyautogui.moveTo(150, 280, duration=0.3)
time.sleep(0.2)
pyautogui.click()
time.sleep(2)

# 5. Click View on first product
pyautogui.moveTo(200, 650, duration=0.3)
time.sleep(0.2)
pyautogui.click()
time.sleep(2)
pyautogui.scroll(-5)
time.sleep(1.5)

# 6. Add to cart
pyautogui.moveTo(560, 650, duration=0.3)
time.sleep(0.2)
pyautogui.click()
time.sleep(2)

# 7. Navigate to cart
pyautogui.moveTo(1750, 60, duration=0.3)
time.sleep(0.2)
pyautogui.click()
time.sleep(2)

# 8. Go to checkout
pyautogui.moveTo(900, 700, duration=0.3)
time.sleep(0.2)
pyautogui.click()
time.sleep(2)
pyautogui.scroll(-8)
time.sleep(2)

# Stop recording
recording = False
time.sleep(0.5)

# === WRITE VIDEO ===
if frames:
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(OUTPUT, fourcc, FPS, (W, H))
    for i, frame in enumerate(frames):
        out.write(frame)
    out.release()
    print(f"\nVideo saved: {OUTPUT}")
    print(f"Frames captured: {len(frames)}")
    print(f"Duration: {len(frames)/FPS:.1f}s")
else:
    print("No frames captured!")
