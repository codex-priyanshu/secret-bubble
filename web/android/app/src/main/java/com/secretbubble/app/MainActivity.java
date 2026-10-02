package com.secretbubble.app;

import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private MediaNotificationManager mediaNotificationManager;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        try {
            WebView webView = getBridge().getWebView();
            if (webView != null) {
                WebSettings settings = webView.getSettings();
                settings.setMediaPlaybackRequiresUserGesture(false);

                // Append SecretBubbleApp and NativeAPK to userAgent for foolproof detection
                String currentUa = settings.getUserAgentString();
                if (currentUa != null && !currentUa.contains("SecretBubbleApp")) {
                    settings.setUserAgentString(currentUa + " SecretBubbleApp/1.0 NativeAPK Capacitor");
                }

                mediaNotificationManager = new MediaNotificationManager(this, webView);
                webView.addJavascriptInterface(mediaNotificationManager, "AndroidNativeMedia");

                // Native App detector bridge for web client
                webView.addJavascriptInterface(new Object() {
                    @JavascriptInterface
                    public boolean isNative() { return true; }
                    @JavascriptInterface
                    public String getVersion() { return "1.0.0"; }
                }, "SecretBubbleNative");
            }
        } catch (Exception ignored) {}
    }

    @Override
    public void onDestroy() {
        if (mediaNotificationManager != null) {
            mediaNotificationManager.destroy();
            mediaNotificationManager = null;
        }
        super.onDestroy();
    }
}
