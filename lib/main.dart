import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:webview_flutter_android/webview_flutter_android.dart';
import 'package:flutter_native_splash/flutter_native_splash.dart';
import 'package:permission_handler/permission_handler.dart';
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
      theme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        scaffoldBackgroundColor: Colors.black,
        colorScheme: const ColorScheme.dark(
          primary: Colors.white,
          surface: Color(0xFF121212),
        ),
      ),
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
  Timer? _failsafeTimer;

  @override
  void initState() {
    super.initState();
    _initializeApp();
  }

  Future<void> _initializeApp() async {
    try {
      // 1. Request Essential Permissions
      await [
        Permission.storage,
        Permission.camera,
        Permission.microphone,
      ].request();

      // 2. Initialize WebView
      final controller = WebViewController()
        ..setJavaScriptMode(JavaScriptMode.unrestricted)
        ..setBackgroundColor(Colors.black)
        ..enableZoom(true)
        ..setNavigationDelegate(
          NavigationDelegate(
            onPageFinished: (_) {
              if (mounted) {
                setState(() => _isLoading = false);
                _failsafeTimer?.cancel();
                FlutterNativeSplash.remove();
              }
            },
            onWebResourceError: (error) {
              // Ignore harmless errors, only report major ones
              if (error.errorCode == -1 || error.description.contains("denied")) {
                _showError("Render Error: ${error.description}\nURL: ${error.url}");
              }
            },
          ),
        );

      if (controller.platform is AndroidWebViewController) {
        AndroidWebViewController.enableDebugging(false);
        (controller.platform as AndroidWebViewController).setAllowFileAccess(true);
        (controller.platform as AndroidWebViewController).setAllowContentAccess(true);
      }

      // 4. Start Failsafe Timer (15 seconds)
      _failsafeTimer = Timer(const Duration(seconds: 15), () {
        if (_isLoading && mounted && _errorMessage == null) {
          _showError("Initialization Timeout: The app is taking too long to load. This might be due to complex assets or a missing entry file.");
        }
      });

      // 5. Load Content Natively (True Offline)
      await controller.loadFlutterAsset('assets/www/index.html');
      
      if (mounted) {
        setState(() {
          _controller = controller;
        });
      }

    } catch (e, stack) {
      _showError("FileSystem Failure: $e\n\n$stack");
    }
  }

  void _showError(String message) {
    if (mounted) {
      setState(() {
        _errorMessage = message;
        _isLoading = false;
      });
      _failsafeTimer?.cancel();
      FlutterNativeSplash.remove();
    }
  }

  @override
  void dispose() {
    _failsafeTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_errorMessage != null) {
      return Scaffold(
        appBar: AppBar(
          title: const Text("Diagnostic Console"),
          backgroundColor: Colors.transparent,
          elevation: 0,
        ),
        body: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Icon(Icons.error_outline_rounded, color: Colors.redAccent, size: 48),
              const SizedBox(height: 16),
              const Text(
                "Loading Failure",
                style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              const Text(
                "The application was unable to render the mirrored content. This is usually due to missing files in the uploaded ZIP or code that requires a full browser environment.",
                style: TextStyle(color: Colors.white60, height: 1.4),
              ),
              const SizedBox(height: 24),
              Expanded(
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E1E1E),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.white10),
                  ),
                  child: SingleChildScrollView(
                    child: SelectableText(
                      _errorMessage!,
                      style: const TextStyle(
                        fontFamily: 'monospace',
                        color: Colors.orangeAccent,
                        fontSize: 12,
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton.icon(
                  onPressed: () {
                    setState(() {
                      _errorMessage = null;
                      _isLoading = true;
                      _controller = null;
                    });
                    _initializeApp();
                  },
                  icon: const Icon(Icons.refresh_rounded),
                  label: const Text("REBOOT ENGINE"),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: Colors.black,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              )
            ],
          ),
        ),
      );
    }

    return Scaffold(
      body: SafeArea(
        child: Stack(
          children: [
            if (_controller != null) WebViewWidget(controller: _controller!),
            if (_isLoading)
              Container(
                color: Colors.black,
                child: const Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      CircularProgressIndicator(color: Colors.white, strokeWidth: 3),
                      SizedBox(height: 24),
                      Text(
                        "PREPARING MIRROR...",
                        style: TextStyle(
                          color: Colors.white38,
                          letterSpacing: 2,
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
