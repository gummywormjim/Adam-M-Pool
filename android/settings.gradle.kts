pluginManagement {
    val flutterSdkPath = run {
        val properties = java.util.Properties()
        val localPropertiesFile = file("local.properties")
        if (localPropertiesFile.exists()) {
            localPropertiesFile.inputStream().use { properties.load(it) }
        }
        val flutterRoot = properties.getProperty("flutter.sdk")
        if (flutterRoot != null) {
            flutterRoot
        } else {
            System.getenv("FLUTTER_ROOT") ?: System.getenv("FLUTTER_HOME") ?: ""
        }
    }

    if (flutterSdkPath.isNotEmpty() && file("$flutterSdkPath/packages/flutter_tools/gradle").exists()) {
        includeBuild("$flutterSdkPath/packages/flutter_tools/gradle")
    }

    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}

plugins {
    id("dev.flutter.flutter-gradle-plugin") version "1.0.0" apply false
}

include(":app")
