<a name="1.5.3"></a>
# 1.5.3 Self Five(2016-08-11)
- Update user config to define application settings.
- Added __dirname reference to be used within web-ui
- Support for future release of save data to file system


<a name="1.5.2"></a>
# 1.5.2 Insane Moose(2016-08-04)
- Upgrade electron to version 1.2.5
- Node 6.3.0
- Chromium 52.0.2743.82
- V8 5.2.361.43
- Update wxs to force close application and reboot if open
- Update downloader to close application on user interaction to close
- Added old code to support desktop application v1.3.3
- Provided API changes to bridge communication


<a name="1.3.4"></a>
# 1.3.4 Ruby Device(2016-06-09)
- Upgrade electron to version 1.2.2
- Node 6.1.0
- Chromium 51.0.2704.84
- V8 5.1.281.59
- Update build script for automation and self downloader

<a name="1.3.3"></a>
# 1.3.3 JEAN GREY (2015-12-07)

## Enhancement
- Update ICON image for product recognition

<a name="1.3.2"></a>
# 1.3.2 OBSIDIAN TRANSISTOR (2015-12-07)

## Bug Fix
- Downgrade electron from 64bit to 32bit version


<a name="1.3.1"></a>
# 1.3.1 Jaerelyx Artigar (2015-12-04)

## Enhancements
- Provide Environment variable on application title bar.
- Update electron bridge with extension of  Electron: v0.35.0, Node: 4.1.1 libraries.
- Move bridge injection on.(did-stop-loading) vs on.(did-finish-load)


## Bug Fix
- Event.on(did-finish-load) was not being called on application environment change.
- Update the Application title bar to display application name.

## Know Bugs
- Working on solution to change Application process name from Electron to application name set from main

## Deprecated
- ctrl+d will be remove on future release of web application, refer to remote-debugging-port <a name="1.2.19"></a>


<a name="1.3.0"></a>
# 1.3.0 facelift (2015-12-03)

## Enhancements
- Introduce new ICON design
- Decrease splash screen image smaller

<a name="1.2.19"></a>
# 1.2.19  Soft Curb (2015-12-03)

## Enhancements
- Remove brute force of the removal of the roaming profile for desktop application
- Replace brute force with chrome command line switches
- Add remote-debugging-port 8989
- Added command --disable-cache

<a name="1.2.18"></a>
# 1.2.18  Nuclear Detergent (2015-12-02)

## Bug
- Use error catch on destroying roaming files.


<a name="1.2.17"></a>
# 1.2.17  DESERT OCTOPUS (2015-12-02)

## Enhancements

- On application load, destroy the application roaming profiles, to load a new profile, this will disable cache.



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


