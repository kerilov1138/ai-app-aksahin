
import http.server
import socketserver
import webbrowser
import threading
import os
import sys

# Sunucu ayarları
PORT = 8000
# Mevcut dosyanın bulunduğu dizini çalışma dizini olarak ayarla
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def log_message(self, format, *args):
        # Konsol çıktısını daha temiz hale getirmek için logları özelleştirebilirsiniz
        sys.stderr.write("%s - - [%s] %s\n" %
                         (self.address_string(),
                          self.log_date_time_string(),
                          format % args))

def open_browser():
    """Tarayıcıyı belirtilen portta açar."""
    url = f"http://localhost:{PORT}"
    print(f"\n[BİLGİ] Tarayıcı açılıyor: {url}")
    webbrowser.open_new(url)

if __name__ == "__main__":
    # Dizin kontrolü
    if not os.path.exists(os.path.join(DIRECTORY, "index.html")):
        print("[HATA] 'index.html' dosyası bulunamadı! Lütfen scripti projenin kök dizininde çalıştırın.")
        sys.exit(1)

    print("="*50)
    print("   İNSAAT MALİYET HESAPLAYICI - YEREL SUNUCU")
    print("="*50)
    print(f"Dizin: {DIRECTORY}")
    print(f"Port:  {PORT}")
    
    # Sunucuyu bir iş parçacığında (thread) başlatmak yerine direkt çalıştırıyoruz, 
    # ancak tarayıcıyı ayrı bir thread'de açıyoruz ki sunucu bloklanmasın.
    threading.Timer(1.5, open_browser).start()

    try:
        with socketserver.TCPServer(("", PORT), CustomHandler) as httpd:
            print(f"\n[OK] Sunucu aktif. Kapatmak için Ctrl+C tuşlarına basın.")
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[BİLGİ] Sunucu kullanıcı tarafından durduruldu. Kapatılıyor...")
        sys.exit(0)
    except Exception as e:
        print(f"\n[HATA] Bir sorun oluştu: {e}")
        sys.exit(1)
