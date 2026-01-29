import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:webview_flutter_android/webview_flutter_android.dart';
import 'package:flutter_native_splash/flutter_native_splash.dart';
import 'dart:async';

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

  @override
  void initState() {
    super.initState();
    _initWebView();
  }

  Future<void> _initWebView() async {
    try {
      final controller = WebViewController()
        ..setJavaScriptMode(JavaScriptMode.unrestricted)
        ..setBackgroundColor(const Color(0x33000000))
        ..enableZoom(true) // Helpful for responsive web content
        ..setNavigationDelegate(
          NavigationDelegate(
            onPageFinished: (_) {
              if (mounted) {
                setState(() => _isLoading = false);
                FlutterNativeSplash.remove();
              }
            },
            onWebResourceError: (error) {
              // Log specific error codes for debugging
              _showError("Web Resource Error: ${error.description}\nCode: ${error.errorCode}\nType: ${error.errorType}\nURL: ${error.url}");
            },
          ),
        );

      // CRITICAL FIX: Ensure file access is allowed for Android
      // This helps with ERR_ACCESS_DENIED on some devices
      if (controller.platform is AndroidWebViewController) {
        (controller.platform as AndroidWebViewController).setAllowFileAccess(true);
        (controller.platform as AndroidWebViewController).setAllowContentAccess(true);
      }

      // We load assets/www/index.html which is our fixed entry point
      await controller.loadFlutterAsset('assets/www/index.html');
      
      if (mounted) {
        setState(() {
          _controller = controller;
        });
      }
      
      // Auto-remove splash if it takes too long but no error reported yet
      Timer(const Duration(seconds: 8), () {
        if (_isLoading && mounted && _errorMessage == null) {
           FlutterNativeSplash.remove();
        }
      });

    } catch (e, stack) {
      _showError("Initialization Error: $e\n\nStacktrace:\n$stack");
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
  Widget build(BuildContext context) {
    if (_errorMessage != null) {
      return Scaffold(
        appBar: AppBar(title: const Text("Diagnostic Tool")),
        body: Container(
          padding: const EdgeInsets.all(16),
          color: Colors.black,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Row(
                children: [
                  Icon(Icons.report_problem, color: Colors.redAccent, size: 30),
                  SizedBox(width: 10),
                  Text("Critical Error", style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.redAccent)),
                ],
              ),
              const SizedBox(height: 20),
              const Text("The application could not load its core files. This usually happens if the entry file is missing or permissions are restricted.", style: TextStyle(color: Colors.white70)),
              const SizedBox(height: 10),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(color: Colors.grey[900], borderRadius: BorderRadius.circular(8)),
                  child: SingleChildScrollView(
                    child: SelectableText(
                      _errorMessage!,
                      style: const TextStyle(fontFamily: 'monospace', color: Colors.greenAccent, fontSize: 12),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () {
                    setState(() {
                      _errorMessage = null;
                      _isLoading = true;
                      _controller = null; 
                    });
                    _initWebView();
                  },
                  icon: const Icon(Icons.refresh),
                  label: const Text("Restart & Try Again"),
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.blueGrey[800], foregroundColor: Colors.white),
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
                    CircularProgressIndicator(),
                    SizedBox(height: 15),
                    Text("Loading interactive mirror...", style: TextStyle(color: Colors.white54)),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }
}
