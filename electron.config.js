module.exports = {

    //for every build on msi the numbers will need to increment to update the
    //msi application stored on windows machine
    "version": "1.3.4",

    "app_name": "LabCorp Phoenix",
    "app_description": "LabCorp Application",
    "manufacturer": "LabCorp Inc",

    //location of main.js and source files
    "source": "app",
    "development": "app",

    //build location
    "distribution": "build",

    //build Electron version
    //<https://github.com/electron-userland/electron-packager/blob/master/usage.txt>
    "platform": "win32", // all, or one or more of: darwin, linux, mas, win32 (comma-delimited if multiple)
    "arch": "ia32", // all, or one or more of: ia32, x64 (comma-delimited if multiple)
    "electronVersion": "0.35.4", // the version of Electron that is being packaged, see https://github.com/electron/electron/releases

    //environment
    "STAGE": "https://stage-phoenix.labcorp.com/web-ui/",
    "UAT": "https://uat-phoenix.labcorp.com/web-ui/",
    "PROD": "https://phoenix.labcorp.com/web-ui/",
    "DEV": "https://dev-phoenix.labcorp.com/web-ui/",
    "QA": "https://qa-phoenix.labcorp.com/web-ui/",
    "LOCAL": "http://local.labcorp.com:8080/",
    "BETA": "https://qa-phoenix.labcorp.com/web-ui/",

    //hosting server setting and working environment
    //Application will check for version updates host path
    "VERSION_SERVER": "https://dev-phoenix.labcorp.com/", //hosting server for all the build packages
    //environment where the build.json is going to be stored for the working environment
    "versionFilePath": "/release/[WORKING_ENVIRONMENT]/build.json",
    //environment to build on start up
    "WORKING_ENVIRONMENT": "DEV"

};

