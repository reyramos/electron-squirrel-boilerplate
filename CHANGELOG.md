<a name="1.2.15"></a>
# 1.2.15  Flaming Metaphor (2015-12-02)

## Enhancements

- Added date query string to rendering process while it loads the BrowserWindow, Hopefully this will resolve the cache issue.


<a name="1.2.14"></a>
# 1.2.14  UNKNOWN WARNING (2015-11-24)

## Bug Fix

- Failed to alert the user of Upgrades
- Failed to allowed for environment changes

<a name="1.2.12"></a>
# 1.2.12  ROWDY CLERIC (2015-11-24)

## Bug Fix

- Failed to open application in the background within VPN, the did-load-completed failed to execute

<a name="1.2.11"></a>
# 1.2.11  JET LIGHTNING (2015-11-19)

## Enhancements

- Update electron-v0.35.0-win32-x64
- Force reload while bootstrapping browserWindow.webContent.on('did-finish-load) => browserWindow.webContents.reloadIgnoringCache()


<a name="1.2.10"></a>
# 1.2.10  SAPPHIRE FALCON (2015-11-13)

## Enhancements

- I lost count


<a name="1.2.6"></a>
# 1.2.8  ORANGE MOTHERBOARD (2015-11-10)

## Enhancements

- Read local config file for environment change.


<a name="1.2.6"></a>
# 1.2.7 TUNDRA GRIZZLY (2015-11-06)

## Bug Fix

- The web application was executing DOM event before the electron app, causing missing delay.
- Added delay for angular bootstrapping, make sure it ready before electron bridge
- Fix error on download = null when on cancel request

## Enhancements

- Fallback on if versioning file does not exist on server.


<a name="1.2.6"></a>
# 1.2.6 SPACE THUNDER (2015-11-06)

## Bug Fix

- The web application was executing DOM event before the electron app, causing missing delay.


<a name="1.2.5"></a>
# 1.2.5 MOUNTAIN STAG (2015-11-05)

## Updates

- Add delay for angular bootstrapping on electron, to initiate any electron bridge



<a name="1.2.4"></a>
# 1.2.4 EMERALD ANDROID (2015-11-05)


## Updates

- **electron v0.34.1** Make auto-updater module work together with Squirrel.Windows

## Features

- Change release branch to development url:https://dev-phoenix.labcorp.com/release/[BUILD]/
- Update code to support new download branch url


## Enhancements

- Build asar and wxs will check release path for version control before msi build


