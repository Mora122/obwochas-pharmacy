"""Record longer walkthrough for Obwocha's Pharmacy investor pitch"""
import mss
import cv2
import numpy as np
import time
import threading
import pyautogui

OUTPUT = r'C:\Users\Administrator\.openclaw\workspace\goodlife-replica\obwocha_pitch_long.mp4'
FPS = 10
DURATION = 52  # seconds - match voiceover
MONITOR = 1

with mss.mss() as sct:
    mon = sct.monitors[MONITOR]
    W, H = mon['width'], mon['height']

frames = []
recording = True

def record():
    with mss.mss() as sct:
        while recording:
            img = sct.grab(sct.monitors[MONITOR])
            frame = np.array(img)[:, :, :3]
            frame = cv2.cvtColor(frame, cv2.COLOR_BGRA2BGR)
            frames.append(frame)
            time.sleep(1.0 / FPS)

print(f"Recording {W}x{H} @ {FPS}fps for {DURATION}s...")
recorder = threading.Thread(target=record, daemon=True)
recorder.start()
time.sleep(0.5)

# === NAVIGATION — slow pace to match voiceover ===

# 1. Homepage (5s)
pyautogui.hotkey('ctrl', 'l')
time.sleep(0.3)
pyautogui.write('http://localhost:8000/index.html')
time.sleep(0.2)
pyautogui.press('enter')
time.sleep(2.5)
pyautogui.scroll(-8)
time.sleep(2)
pyautogui.scroll(8)
time.sleep(2)

# 2. Navigate to Shop (4s)
pyautogui.moveTo(300, 120, duration=0.4)
time.sleep(0.2)
pyautogui.click()
time.sleep(2)
pyautogui.scroll(-3)
time.sleep(2)

# 3. Category filter: Skin Care (4s)
pyautogui.moveTo(150, 370, duration=0.4)
time.sleep(0.2)
pyautogui.click()
time.sleep(2)
pyautogui.scroll(-3)
time.sleep(2)

# 4. Show All Products (3s)
pyautogui.moveTo(150, 280, duration=0.3)
time.sleep(0.2)
pyautogui.click()
time.sleep(3)

# 5. View product detail (4s)
pyautogui.moveTo(200, 650, duration=0.4)
time.sleep(0.2)
pyautogui.click()
time.sleep(2)
pyautogui.scroll(-5)
time.sleep(2)

# 6. Add to cart (3s)
pyautogui.moveTo(560, 650, duration=0.4)
time.sleep(0.2)
pyautogui.click()
time.sleep(3)

# 7. Go back, add another item (5s)
pyautogui.moveTo(200, 120, duration=0.3)
time.sleep(0.2)
pyautogui.click()
time.sleep(0.5)
pyautogui.moveTo(300, 120, duration=0.3)
time.sleep(0.2)
pyautogui.click()
time.sleep(2)
# Add first product
pyautogui.moveTo(320, 680, duration=0.3)
time.sleep(0.2)
pyautogui.click()
time.sleep(2)
# Scroll for variety
pyautogui.scroll(-8)
time.sleep(2)

# 8. View cart (4s)
pyautogui.moveTo(1750, 60, duration=0.4)
time.sleep(0.2)
pyautogui.click()
time.sleep(2)
pyautogui.scroll(-3)
time.sleep(2)

# 9. Checkout page (5s)
pyautogui.moveTo(900, 700, duration=0.4)
time.sleep(0.2)
pyautogui.click()
time.sleep(2)
pyautogui.scroll(-8)
time.sleep(3)

# 10. Back to homepage (4s)
pyautogui.moveTo(200, 120, duration=0.3)
time.sleep(0.2)
pyautogui.click()
time.sleep(1)
pyautogui.moveTo(100, 60, duration=0.3)
time.sleep(0.2)
pyautogui.click()
time.sleep(2)
pyautogui.scroll(-5)
time.sleep(2)

# 11. Final pause (3s)
pyautogui.scroll(5)
time.sleep(3)

# Stop recording
recording = False
time.sleep(0.5)

# === WRITE VIDEO ===
if frames:
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(OUTPUT, fourcc, FPS, (W, H))
    for frame in frames:
        out.write(frame)
    out.release()
    print(f"\nVideo saved: {OUTPUT}")
    print(f"Frames: {len(frames)}, Duration: {len(frames)/FPS:.1f}s")
else:
    print("No frames captured!")
