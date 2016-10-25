module.exports = {
    /*************************************************************
     * These are also defined in the app/util/config page, where it will
     * set the default values of they dont exist on this file.
     *
     */
    //location of main.js and source files
    "source": ".",

    //build location
    "distribution": "build",

    //build Electron version
    //<https://github.com/electron-userland/electron-packager/blob/master/usage.txt>
    "platform": "win32", // all, or one or more of: darwin, linux, mas, win32 (comma-delimited if multiple)
    "arch": "ia32", // all, or one or more of: ia32, x64 (comma-delimited if multiple)
    "electronVersion": "1.2.5", // the version of Electron that is being packaged, see https://github.com/electron/electron/releases
    //currently version 1.2.5 is the only one compatible with electron-printer


    /*************************************************************
     * The following will affect the way the application start
     */

    //environment
    "SITE": "https://reymundoramos.com",
    //hosting server setting and working environment
    //Application will check for version updates host path
    "versionServer": "http://localhost/releases/win/build.json",
    //environment to build on start up
    "startingEnvironment": "SITE"

};

