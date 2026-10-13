import os
import sys

manifest_path = "android/app/src/main/AndroidManifest.xml"
if not os.path.exists(manifest_path):
    print(f"Notice: {manifest_path} not found. Skipping manifest patch.")
    sys.exit(0)

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
    print("Manifest patch completed successfully.")
except Exception as e:
    print(f"Notice during manifest patch: {e}")
