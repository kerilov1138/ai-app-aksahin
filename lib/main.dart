import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
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
  late final WebViewController _controller;

  @override
  void initState() {
    super.initState();
    _initWebView();
  }

  Future<void> _initWebView() async {
    try {
      _controller = WebViewController()
        ..setJavaScriptMode(JavaScriptMode.unrestricted)
        ..setBackgroundColor(const Color(0x00000000))
        ..setNavigationDelegate(
          NavigationDelegate(
            onPageFinished: (_) {
              if (mounted) {
                setState(() => _isLoading = false);
                FlutterNativeSplash.remove();
              }
            },
            onWebResourceError: (error) {
              _showError("Web Resource Error: ${error.description}");
            },
          ),
        );

      await _controller.loadFlutterAsset('assets/www/index.html');
      
      // Auto-remove splash if it takes too long but no error reported yet
      Timer(const Duration(seconds: 5), () {
        if (_isLoading && mounted) {
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
          color: Colors.black87,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Row(
                children: [
                  Icon(Icons.warning_amber_rounded, color: Colors.orange, size: 30),
                  SizedBox(width: 10),
                  Text("Error Detected", style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.orange)),
                ],
              ),
              const SizedBox(height: 20),
              const Text("App failed to load localized assets. Details:", style: TextStyle(color: Colors.white70)),
              const SizedBox(height: 10),
              Expanded(
                child: SingleChildScrollView(
                  child: SelectableText(
                    _errorMessage!,
                    style: const TextStyle(fontFamily: 'monospace', color: Colors.redAccent, fontSize: 13),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () => _initWebView(),
                  icon: const Icon(Icons.refresh),
                  label: const Text("Try Again"),
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
            WebViewWidget(controller: _controller),
            if (_isLoading)
              const Center(child: CircularProgressIndicator()),
          ],
        ),
      ),
    );
  }
}
