"""Simple HTTP server to serve the investor pitch video for phone download"""
import http.server
import os
import socket
import threading

PORT = 18899
VIDEO = r'C:\Users\Administrator\.openclaw\workspace\goodlife-replica\obwocha_investor_pitch.mp4'

class VideoHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-Type', 'video/mp4')
        self.send_header('Content-Disposition', 'attachment; filename="obwocha_investor_pitch.mp4"')
        self.send_header('Content-Length', str(os.path.getsize(VIDEO)))
        self.end_headers()
        with open(VIDEO, 'rb') as f:
            self.wfile.write(f.read())
    def log_message(self, format, *args):
        print(f"[{self.client_address[0]}] {format % args}")

server = http.server.HTTPServer(('0.0.0.0', PORT), VideoHandler)
print(f"Server running on port {PORT}")

# Get local IP
s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
try:
    s.connect(('8.8.8.8', 80))
    ip = s.getsockname()[0]
except:
    ip = '127.0.0.1'
s.close()

print(f"Download link: http://{ip}:{PORT}/video.mp4")
server.serve_forever()
