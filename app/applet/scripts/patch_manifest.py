import os
import sys
import re

# 1. Patch AndroidManifest.xml
manifest_path = "android/app/src/main/AndroidManifest.xml"
if os.path.exists(manifest_path):
    try:
        with open(manifest_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Add INTERNET permission if not present
        if 'android.permission.INTERNET' not in content:
            content = content.replace('<application', '<uses-permission android:name="android.permission.INTERNET"/>\n    <application')

        # Add queries for dialer / SMS if not present
        if '<queries>' not in content and '</manifest>' in content:
            queries_block = """    <queries>
        <intent>
            <action android:name="android.intent.action.DIAL" />
            <data android:scheme="tel" />
        </intent>
        <intent>
            <action android:name="android.intent.action.VIEW" />
            <data android:scheme="sms" />
        </intent>
    </queries>
</manifest>"""
            content = content.replace('</manifest>', queries_block)

        with open(manifest_path, "w", encoding="utf-8") as f:
            f.write(content)
        print("AndroidManifest.xml patched successfully.")
    except Exception as e:
        print(f"Notice during manifest patch: {e}")
else:
    print(f"Notice: {manifest_path} not found.")

# 2. Patch build.gradle / build.gradle.kts to ensure minSdk >= 21
gradle_files = [
    "android/app/build.gradle",
    "android/app/build.gradle.kts"
]

for g_file in gradle_files:
    if os.path.exists(g_file):
        try:
            with open(g_file, "r", encoding="utf-8") as f:
                content = f.read()
            # Replace minSdkVersion flutter.minSdkVersion or 16 with 21 if present
            patched = False
            if 'minSdkVersion 16' in content:
                content = content.replace('minSdkVersion 16', 'minSdkVersion 21')
                patched = True
            if 'minSdk = 16' in content:
                content = content.replace('minSdk = 16', 'minSdk = 21')
                patched = True
            if patched:
                with open(g_file, "w", encoding="utf-8") as f:
                    f.write(content)
                print(f"{g_file} patched with minSdk 21 successfully.")
        except Exception as e:
            print(f"Notice during {g_file} patch: {e}")
