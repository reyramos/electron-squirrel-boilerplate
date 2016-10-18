module.exports = {
    /*************************************************************
     * These are also defined in the app/util/config page, where it will
     * set the default values of they dont exist on this file.
     *
     */
    //for every build on msi the numbers will need to increment to update the
    //msi application stored on windows machine
    "version": "1.5.8",

    "app_name": "LabCorp Phoenix",
    "app_description": "LabCorp Application",
    "manufacturer": "LabCorp Inc",

    //location of main.js and source files
    "source": "app",

    //build location
    "distribution": "build",

    //build Electron version
    //<https://github.com/electron-userland/electron-packager/blob/master/usage.txt>
    "platform": "win32", // all, or one or more of: darwin, linux, mas, win32 (comma-delimited if multiple)
    "arch": "ia32", // all, or one or more of: ia32, x64 (comma-delimited if multiple)
    "electronVersion": "1.2.5", // the version of Electron that is being packaged, see https://github.com/electron/electron/releases
    //currently version 1.2.5 is the only one compatible with electron-printer

    //WixToolSet: Identifiers may contain ASCII characters A-Z, a-z, digits, underscores (_), or periods (.).  Every identifier must begin with either a letter or an underscore.
    "execName": "phoenix.exe",

    /*************************************************************
     * The following will affect the way the application start
     */

    //environment
    "STAGE": "https://stage-phoenix.labcorp.com/web-ui/",
    "UAT": "https://uat-phoenix.labcorp.com/web-ui/",
    "PROD": "https://phoenix.labcorp.com/web-ui/",
    "DEV": "https://dev-phoenix.labcorp.com/web-ui/",
    "QA": "https://qa-phoenix.labcorp.com/web-ui/",
    "BETA": "http://dev2-phoenix.labcorp.com/web-ui/?debug=true",
    "RELEASE2": "http://dev2-phoenix.labcorp.com/web-ui/?debug=true",
    "LOCAL": "http://seed.labcorp.com:8080/",

    //hosting server setting and working environment
    //Application will check for version updates host path
    // "versionServer": "https://dev-phoenix.labcorp.com/release/prod/build.json",
    "versionServer": "http://localhost/ELECTRON_TEST/build.json",
    //environment to build on start up
    "startingEnvironment": "PROD"

};

