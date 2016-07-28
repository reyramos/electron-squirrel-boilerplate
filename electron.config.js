module.exports = {

    //for every build on msi the numbers will need to increment to update the
    //msi application stored on windows machine
    "version": "1.4.0",

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

    //WixToolSet: Identifiers may contain ASCII characters A-Z, a-z, digits, underscores (_), or periods (.).  Every identifier must begin with either a letter or an underscore.
    "execName": "phoenix.exe",


    //environment
    "STAGE": "https://stage-phoenix.labcorp.com/web-ui/",
    "UAT": "https://uat-phoenix.labcorp.com/web-ui/",
    "PROD": "https://phoenix.labcorp.com/web-ui/",
    "DEV": "https://dev-phoenix.labcorp.com/web-ui/",
    "QA": "https://qa-phoenix.labcorp.com/web-ui/",
    "BETA": "https://dev-phoenix.labcorp.com/web-ui/",
    "RELEASE2": "http://dev2-phoenix.labcorp.com/web-ui/#/",
    "LOCAL": "file://__dirname/demo/index.html",

    //hosting server setting and working environment
    //Application will check for version updates host path
    "VERSION_SERVER": "https://dev-phoenix.labcorp.com/", //hosting server for all the build packages
    //environment where the build.json is going to be stored for the working environment
    "versionFilePath": "/release/[WORKING_ENVIRONMENT]/build.json",
    //environment to build on start up
    "WORKING_ENVIRONMENT": "LOCAL"

};

