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


