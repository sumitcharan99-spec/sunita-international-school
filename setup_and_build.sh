#!/bin/bash
set -e # Exit immediately on error

echo "=== Resolving Apt Locks ==="
rm -f /var/lib/dpkg/lock-frontend /var/lib/dpkg/lock /var/lib/apt/lists/lock /var/cache/apt/archives/lock
dpkg --configure -a || true

echo "=== System Update and Installing Java, xz-utils and dependencies ==="
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" openjdk-17-jdk-headless xz-utils zip unzip wget curl git libglu1-mesa

echo "=== Configuring Git Safe Directories ==="
git config --global --add safe.directory /opt/flutter
git config --global --add safe.directory /app/applet
git config --global --add safe.directory '*'

echo "=== Creating Installation Directories ==="
mkdir -p /opt/android-sdk/cmdline-tools
mkdir -p /opt/flutter

echo "=== Downloading Flutter SDK ==="
# We use 3.24.3 stable which is a reliable and modern version of Flutter
wget -q https://storage.googleapis.com/flutter_infra_release/releases/stable/linux/flutter_linux_3.24.3-stable.tar.xz -O /tmp/flutter.tar.xz

echo "=== Extracting Flutter SDK ==="
tar -xf /tmp/flutter.tar.xz -C /opt
rm /tmp/flutter.tar.xz

echo "=== Downloading Android Command Line Tools ==="
wget -q https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip -O /tmp/cmdline-tools.zip

echo "=== Extracting Android Command Line Tools ==="
unzip -q /tmp/cmdline-tools.zip -d /opt/android-sdk/cmdline-tools
mv /opt/android-sdk/cmdline-tools/cmdline-tools /opt/android-sdk/cmdline-tools/latest
rm /tmp/cmdline-tools.zip

echo "=== Setting Environment Variables ==="
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export ANDROID_HOME=/opt/android-sdk
export PATH=$PATH:/opt/flutter/bin:/opt/android-sdk/cmdline-tools/latest/bin:/opt/android-sdk/platform-tools

echo "=== Verifying Tool Availability ==="
echo "Java Version:"
java -version
echo "Flutter Version:"
flutter --version

echo "=== Accepting Android SDK Licenses ==="
# Accept licenses automatically
yes | sdkmanager --licenses

echo "=== Installing Android Platforms & Build Tools ==="
sdkmanager "platform-tools" "build-tools;34.0.0" "platforms;android-34"

echo "=== Configuring Flutter with Android SDK ==="
flutter config --android-sdk /opt/android-sdk

echo "=== Accepting Doctor Android Licenses ==="
yes | flutter doctor --android-licenses

echo "=== Checking Flutter Doctor ==="
flutter doctor

echo "=== Cleaning Project ==="
flutter clean

echo "=== Getting Flutter Packages ==="
flutter pub get

echo "=== Building Release APK ==="
flutter build apk --release

echo "=== Verifying Built APK ==="
if [ -f "build/app/outputs/flutter-apk/app-release.apk" ]; then
    echo "SUCCESS: APK created successfully!"
    ls -lh build/app/outputs/flutter-apk/app-release.apk
else
    echo "ERROR: APK was not built."
    exit 1
fi
