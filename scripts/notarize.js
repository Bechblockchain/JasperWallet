const { notarize } = require('electron-notarize');
var appBundleId = require('../package.json').build.appId;


// You will need to notarize the application if the "Developer ID Application" user is first time signing
exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;  
  if (electronPlatformName !== 'darwin') {
    console.log('Skipping notarizing because this is not a macOS build.');
    return;
  } else if (process.env.DESKTOP_APP_NOTARIZE !== 'true') {
    console.log('Skipping notarizing because DESKTOP_APP_NOTARIZE env is not set.');
    return;
  } else if (process.env.DESKTOP_APP_APPLE_ID === undefined || process.env.DESKTOP_APP_APPLE_PASSWORD === undefined) {
    console.log('Skipping notarizing because DESKTOP_APP_APPLE_ID or DESKTOP_APP_APPLE_PASSWORD env are not set.');
    return;
  }
  const appName = context.packager.appInfo.productFilename;
  const appPath = `${appOutDir}/${appName}.app`;

  console.log(`Notarizing ${appName} with bundleId[${appBundleId}] at ${appPath}`);

  return await notarize({
    appBundleId: appBundleId,
    appPath: appPath,
    appleId: process.env.DESKTOP_APP_APPLE_ID,
    appleIdPassword: process.env.DESKTOP_APP_APPLE_PASSWORD,
  });
};