#!/bin/bash
# Script to retrieve SHA-1 and SHA-256 fingerprints for Firebase Android configuration.

echo "=========================================================="
echo "      Sunita School Portal - SHA Fingerprint Utility      "
echo "=========================================================="
echo ""

if [ -f "$HOME/.android/debug.keystore" ]; then
    echo "Default debug.keystore found. Fetching fingerprints..."
    keytool -list -v -alias androiddebugkey -keystore "$HOME/.android/debug.keystore" -storepass android
elif [ -f "android/app/debug.keystore" ]; then
    echo "Local debug.keystore found. Fetching fingerprints..."
    keytool -list -v -alias androiddebugkey -keystore android/app/debug.keystore -storepass android
else
    echo "No debug.keystore found in default locations."
    echo "You can generate one using:"
    echo "  keytool -genkey -v -keystore ~/.android/debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000"
    echo ""
    echo "Or on Windows (PowerShell):"
    echo "  keytool -list -v -alias androiddebugkey -keystore \$env:USERPROFILE\.android\debug.keystore -storepass android"
fi
