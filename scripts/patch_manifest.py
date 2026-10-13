import os
import sys

manifest_path = "android/app/src/main/AndroidManifest.xml"
if not os.path.exists(manifest_path):
    print(f"Notice: {manifest_path} not found. Skipping manifest patch.")
    sys.exit(0)

try:
    with open(manifest_path, "r", encoding="utf-8") as f:
        content = f.read()

    queries_block = """
    <uses-permission android:name="android.permission.INTERNET"/>
    <queries>
        <intent>
            <action android:name="android.intent.action.DIAL" />
            <data android:scheme="tel" />
        </intent>
        <intent>
            <action android:name="android.intent.action.VIEW" />
            <data android:scheme="sms" />
        </intent>
        <intent>
            <action android:name="android.intent.action.VIEW" />
            <data android:scheme="https" />
        </intent>
    </queries>
</manifest>"""

    if "<queries>" not in content and "</manifest>" in content:
        content = content.replace("</manifest>", queries_block)
        with open(manifest_path, "w", encoding="utf-8") as f:
            f.write(content)
        print("Successfully injected 988 Lifeline dialer/SMS queries into AndroidManifest.xml")
    else:
        print("AndroidManifest.xml already contains queries or format differs. Proceeding.")
except Exception as e:
    print(f"Notice during manifest patch: {e}")
