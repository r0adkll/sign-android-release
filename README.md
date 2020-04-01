# Sign Android Release Action

This action will help you sign an Android `.apk` or `.aab` (Android App Bundle) file for release.

## Inputs

### `releaseDirectory`

**Required:** The relative directory path in your project where your Android release file will be located

### `signingKeyBase64`

**Required:** The base64 encoded signing key used to sign your app

This action will directly decode this input to a file to sign your release with. You can prepare your key by running this command on *nix systems.

```bash
openssl base64 < some_signing_key.jks | tr -d '\n' | tee some_signing_key.jks.base64.txt
```
Then copy the contents of the `.txt` file to your GH secrets

### `alias`

**Required:** The alias of your signing key 

### `keyStorePassword`

**Required:** The password to your signing keystore

### `keyPassword`

**Optional:** The private key password for your signing keystore

## Outputs

### `signedReleaseFile`

The path to the signed release file from this action

### ENV: `SIGNED_RELEASE_FILE`

This also set's an environment variable that points to the signed release file

## Example usage

```yaml
uses: r0adkll/sign-android-release@v1
with:
  releaseDirectory: /app/build/outputs/apk/release
  signingKeyBase64: ${{ secrets.SIGNING_KEY }}
  alias: ${{ secrets.ALIAS }}
  keyStorePassword: ${{ secrets.KEY_STORE_PASSWORD }}
  keyPassword: ${{ secrets.KEY_PASSWORD }}
```
