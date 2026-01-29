import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:webview_flutter_android/webview_flutter_android.dart';
import 'package:flutter_native_splash/flutter_native_splash.dart';
import 'package:flutter/services.dart' show rootBundle;
import 'dart:async';
import 'dart:io';

void main() {
  WidgetsBinding widgetsBinding = WidgetsFlutterBinding.ensureInitialized();
  FlutterNativeSplash.preserve(widgetsBinding: widgetsBinding);
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(useMaterial3: true, brightness: Brightness.dark),
      home: const MainContainer(),
    );
  }
}

class MainContainer extends StatefulWidget {
  const MainContainer({super.key});

  @override
  State<MainContainer> createState() => _MainContainerState();
}

class _MainContainerState extends State<MainContainer> {
  String? _errorMessage;
  bool _isLoading = true;
  WebViewController? _controller;
  HttpServer? _server;
  final int _port = 8080;

  @override
  void initState() {
    super.initState();
    _startServerAndLoad();
  }

  Future<void> _startServerAndLoad() async {
    try {
      // 1. Start Local Asset Server
      await _startLocalServer();

      // 2. Initialize WebView
      final controller = WebViewController()
        ..setJavaScriptMode(JavaScriptMode.unrestricted)
        ..setBackgroundColor(const Color(0x33000000))
        ..enableZoom(true)
        ..setNavigationDelegate(
          NavigationDelegate(
            onPageFinished: (_) {
              if (mounted) {
                setState(() => _isLoading = false);
                FlutterNativeSplash.remove();
              }
            },
            onWebResourceError: (error) {
              // Only report "Critical" errors to user
              if (error.errorCode == -1 || error.description.contains("denied")) {
                 _showError("Web Content Error: ${error.description}\nCode: ${error.errorCode}\nURL: ${error.url}");
              }
            },
          ),
        );

      if (controller.platform is AndroidWebViewController) {
        (controller.platform as AndroidWebViewController).setAllowFileAccess(true);
        (controller.platform as AndroidWebViewController).setAllowContentAccess(true);
      }

      // 3. Load from LOCALHOST (fixes absolute paths)
      await controller.loadRequest(Uri.parse('http://localhost:$_port/index.html'));
      
      if (mounted) {
        setState(() {
          _controller = controller;
        });
      }
      
      Timer(const Duration(seconds: 10), () {
        if (_isLoading && mounted && _errorMessage == null) {
           FlutterNativeSplash.remove();
        }
      });

    } catch (e, stack) {
      _showError("Startup Error: $e\n\nStacktrace:\n$stack");
    }
  }

  Future<void> _startLocalServer() async {
    if (_server != null) return;
    try {
      _server = await HttpServer.bind(InternetAddress.loopbackIPv4, _port);
      _server!.listen((HttpRequest request) async {
        try {
          String path = request.uri.path == '/' ? '/index.html' : request.uri.path;
          String assetPath = 'assets/www$path';
          
          final content = await rootBundle.load(assetPath);
          final bytes = content.buffer.asUint8List();
          
          // Set content type
          if (path.endsWith('.html')) request.response.headers.contentType = ContentType.html;
          else if (path.endsWith('.js') || path.endsWith('.tsx')) request.response.headers.contentType = ContentType.parse('application/javascript');
          else if (path.endsWith('.css')) request.response.headers.contentType = ContentType.parse('text/css');
          else if (path.endsWith('.json')) request.response.headers.contentType = ContentType.parse('application/json');
          else if (path.endsWith('.svg')) request.response.headers.contentType = ContentType.parse('image/svg+xml');
          else if (path.endsWith('.png')) request.response.headers.contentType = ContentType.parse('image/png');
          else if (path.endsWith('.jpg') || path.endsWith('.jpeg')) request.response.headers.contentType = ContentType.parse('image/jpeg');
          
          request.response.add(bytes);
        } catch (e) {
          debugPrint("Server handling error for ${request.uri.path}: $e");
          request.response.statusCode = HttpStatus.notFound;
          request.response.write("File not found or inaccessible: ${request.uri.path}");
        } finally {
          await request.response.close();
        }
      });
    } catch (e) {
      debugPrint("Server Error: $e");
      rethrow;
    }
  }

  void _showError(String message) {
    if (mounted) {
      setState(() {
        _errorMessage = message;
        _isLoading = false;
      });
      FlutterNativeSplash.remove();
    }
  }

  @override
  void dispose() {
    _server?.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_errorMessage != null) {
      return Scaffold(
        backgroundColor: Colors.black,
        appBar: AppBar(title: const Text("Diagnostic Tool"), backgroundColor: Colors.black, foregroundColor: Colors.white),
        body: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Row(
                children: [
                  Icon(Icons.warning_amber_rounded, color: Colors.redAccent, size: 35),
                  SizedBox(width: 15),
                  Text("Content Restricted", style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.redAccent)),
                ],
              ),
              const SizedBox(height: 20),
              const Text("The app encountered an error while loading internal components. This usually means the source code uses complex references.", style: TextStyle(color: Colors.white70)),
              const SizedBox(height: 15),
              Expanded(
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(color: Color(0xFF121212), borderRadius: BorderRadius.circular(10), border: Border.all(color: Colors.white12)),
                  child: SingleChildScrollView(
                    child: SelectableText(
                      _errorMessage!,
                      style: const TextStyle(fontFamily: 'monospace', color: Colors.greenAccent, fontSize: 13),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 30),
              SizedBox(
                width: double.infinity,
                height: 55,
                child: ElevatedButton.icon(
                  onPressed: () {
                    setState(() {
                      _errorMessage = null;
                      _isLoading = true;
                      _controller = null;
                    });
                    _startServerAndLoad();
                  },
                  icon: const Icon(Icons.refresh_rounded),
                  label: const Text("REBOOT APP", style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1.2)),
                  style: ElevatedButton.styleFrom(backgroundColor: Color(0xFF2C2C2C), foregroundColor: Colors.white, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                ),
              )
            ],
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: Colors.black,
      body: SafeArea(
        child: Stack(
          children: [
            if (_controller != null) WebViewWidget(controller: _controller!),
            if (_isLoading)
              const Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    CircularProgressIndicator(color: Colors.white),
                    SizedBox(height: 25),
                    Text("Syncing Mirror...", style: TextStyle(color: Colors.white54, letterSpacing: 1.5, fontSize: 13)),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }
}
