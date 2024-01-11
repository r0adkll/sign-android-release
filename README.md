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

## ENV: `BUILD_TOOLS_VERSION`

**Optional:** You can manually specify a version of build-tools to use. We use `34.0.0` by default.

## Outputs

Output variables are set both locally and in environment variables.

### `signedReleaseFile`/ ENV: `SIGNED_RELEASE_FILE`

The path to the single release file that have been signed with this action.
Not set if several release files have been signed.

### `signedReleaseFiles` / ENV: `SIGNED_RELEASE_FILES`

The paths to the release files that have been signed with this action,
separated by `:`.

## Example usage

### Single APK

The output variable `signedReleaseFile` can be used in a release action.

```yaml
steps:
  - uses: noriban/sign-android-release@v3
    name: Sign app APK
    # ID used to access action output
    id: sign_app
    with:
      releaseDirectory: app/build/outputs/apk/release
      signingKeyBase64: ${{ secrets.SIGNING_KEY }}
      alias: ${{ secrets.ALIAS }}
      keyStorePassword: ${{ secrets.KEY_STORE_PASSWORD }}
      keyPassword: ${{ secrets.KEY_PASSWORD }}
    env:
      # override default build-tools version (34.0.0) -- optional
      BUILD_TOOLS_VERSION: "34.0.0"

  # Example use of `signedReleaseFile` output -- not needed
  - uses: actions/upload-artifact@v2
    with:
      name: Signed app bundle
      path: ${{steps.sign_app.outputs.signedReleaseFile}}
```

### Multiple APKs, multiple variables

The output variables `signedReleaseFileX`
can be used to refer to each signed release file.

```yaml
steps:
  - uses: noriab/sign-android-release@v4
    id: sign_app
    with:
      releaseDirectory: app/build/outputs/apk/release
      signingKeyBase64: ${{ secrets.SIGNING_KEY }}
      alias: ${{ secrets.ALIAS }}
      keyStorePassword: ${{ secrets.KEY_STORE_PASSWORD }}
      keyPassword: ${{ secrets.KEY_PASSWORD }}

  - name: Example Release
    uses: "marvinpinto/action-automatic-releases@latest"
    with:
      repo_token: "${{ secrets.GITHUB_TOKEN }}"
      automatic_release_tag: "latest"
      prerelease: true
      title: "Release X"
      files: |
        ${{ steps.sign_app.outputs.signedReleaseFile0 }}
        ${{ steps.sign_app.outputs.signedReleaseFile1 }}
        ${{ steps.sign_app.outputs.signedReleaseFile2 }}
        ${{ steps.sign_app.outputs.signedReleaseFile3 }}
        ${{ steps.sign_app.outputs.signedReleaseFile4 }}
```

### Multiple APKs, single variable

The output variable `signedReleaseFiles` must be split first,
before being used in a release action.

```yaml
steps:
  - uses: noriban/sign-android-release@v4
    id: sign_app
    with:
      releaseDirectory: app/build/outputs/apk/release
      signingKeyBase64: ${{ secrets.SIGNING_KEY }}
      alias: ${{ secrets.ALIAS }}
      keyStorePassword: ${{ secrets.KEY_STORE_PASSWORD }}
      keyPassword: ${{ secrets.KEY_PASSWORD }}

  - uses: jungwinter/split@v1
    id: signed_files
    with:
      msg: ${{ steps.sign_app.outputs.signedReleaseFiles }}
      separator: ':'

  - name: Example Release
    uses: "marvinpinto/action-automatic-releases@latest"
    with:
      repo_token: "${{ secrets.GITHUB_TOKEN }}"
      automatic_release_tag: "latest"
      prerelease: true
      title: "Release X"
      files: |
        ${{ steps.signed_files._0 }}
        ${{ steps.signed_files._1 }}
        ${{ steps.signed_files._2 }}
        ${{ steps.signed_files._3 }}
        ${{ steps.signed_files._4 }}
```
