#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ANDROID_DIR="$ROOT_DIR/android-src"
BUILD_DIR="$ANDROID_DIR/build"
WWW_DIR="$BUILD_DIR/www"
RES_DIR="$BUILD_DIR/res"
OBJ_DIR="$BUILD_DIR/obj"
GEN_DIR="$BUILD_DIR/gen"
KEYSTORE="$ANDROID_DIR/pedidos-release.jks"
ANDROID_JAR="/usr/lib/android-sdk/platforms/android-23/android.jar"

if [ ! -f "$ANDROID_JAR" ]; then
  echo "android.jar not found at $ANDROID_JAR" >&2
  exit 1
fi

rm -rf "$BUILD_DIR"
mkdir -p "$WWW_DIR" "$RES_DIR/drawable" "$OBJ_DIR" "$GEN_DIR"

# 1. Build web bundle into temporary www directory (without recursion of pedidos.apk)
cd "$ROOT_DIR"
npx vite build --outDir "$WWW_DIR"
rm -rf "$WWW_DIR/assets/aistudio"
rm -f "$WWW_DIR/pedidos.apk" "$WWW_DIR/pedidos.apk.idsig" "$WWW_DIR/sw.js" "$WWW_DIR/workbox-"*.js

# 2. Copy launcher icon
cp "$ROOT_DIR/public/pwa-192x192.png" "$RES_DIR/drawable/ic_launcher.png"

# 3. Compile resources & generate R.java
aapt package -f -m \
  -J "$GEN_DIR" \
  -M "$ANDROID_DIR/AndroidManifest.xml" \
  -S "$RES_DIR" \
  -I "$ANDROID_JAR"

# 4. Compile Java sources targeting Java 8 bytecode for dx/Android 7+
javac -source 1.8 -target 1.8 \
  -bootclasspath "$ANDROID_JAR" \
  -d "$OBJ_DIR" \
  "$GEN_DIR/com/pedidos/cocina/R.java" \
  "$ANDROID_DIR/java/com/pedidos/cocina/MainActivity.java"

# 5. Convert .class files to Dalvik classes.dex
dalvik-exchange --dex --output="$BUILD_DIR/classes.dex" "$OBJ_DIR"

# 6. Package unsigned APK with resources and assets
aapt package -f \
  -M "$ANDROID_DIR/AndroidManifest.xml" \
  -S "$RES_DIR" \
  -A "$WWW_DIR" \
  -I "$ANDROID_JAR" \
  -F "$BUILD_DIR/unsigned.apk"

# 7. Add classes.dex to APK
(cd "$BUILD_DIR" && aapt add unsigned.apk classes.dex >/dev/null)

# 8. Zipalign APK
zipalign -f -p 4 "$BUILD_DIR/unsigned.apk" "$BUILD_DIR/aligned.apk"

# 9. Create signing keystore if missing
if [ ! -f "$KEYSTORE" ]; then
  keytool -genkeypair -v \
    -keystore "$KEYSTORE" \
    -alias pedidos \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000 \
    -storepass pedidos2026 \
    -keypass pedidos2026 \
    -dname "CN=Pedidos Cocina, OU=Cocina, O=Pedidos, L=Madrid, S=Madrid, C=ES"
fi

# 10. Sign APK (v1 + v2 + v3 for full Android compatibility) and verify
apksigner sign \
  --ks "$KEYSTORE" \
  --ks-key-alias pedidos \
  --ks-pass pass:pedidos2026 \
  --key-pass pass:pedidos2026 \
  --v1-signing-enabled true \
  --v2-signing-enabled true \
  --v3-signing-enabled true \
  --v4-signing-enabled false \
  --out "$ROOT_DIR/public/pedidos.apk" \
  "$BUILD_DIR/aligned.apk"

rm -f "$ROOT_DIR/public/pedidos.apk.idsig"
zipalign -c -v 4 "$ROOT_DIR/public/pedidos.apk" >/dev/null
apksigner verify --verbose "$ROOT_DIR/public/pedidos.apk"
ls -lh "$ROOT_DIR/public/pedidos.apk"
