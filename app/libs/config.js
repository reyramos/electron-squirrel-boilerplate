/**
 * Created by ramor11 on 9/8/2016.
 */
module.exports = {
    //for every build on msi the numbers will need to increment to update the
    //msi application stored on windows machine
    "version": "number",

    "app_name": "string",
    "app_description": "string",
    "manufacturer": "string",

    //location of main.js and source files
    "source": "string",

    //build location
    "distribution": "string",

    //build Electron version
    //<https://github.com/electron-userland/electron-packager/blob/master/usage.txt>
    "platform": "string", // all, or one or more of: darwin, linux, mas, win32 (comma-delimited if multiple)
    "arch": "string", // all, or one or more of: ia32, x64 (comma-delimited if multiple)
    "electronVersion": "number", // the version of Electron that is being packaged, see https://github.com/electron/electron/releases

    //WixToolSet: Identifiers may contain ASCII characters A-Z, a-z, digits, underscores (_), or periods (.).  Every identifier must begin with either a letter or an underscore.
    "execName": "string",

    //hosting server setting and working environment
    //Application will check for version updates host path
    "VERSION_SERVER": "string", //hosting server for all the build packages
    //environment where the build.json is going to be stored for the working environment
    "versionFilePath": "string",
    //environment to build on start up
    "WORKING_ENVIRONMENT": "string"
};