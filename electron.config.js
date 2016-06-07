module.exports = {
    
    //for every build on msi the numbers will need to increment to update the
    //msi application stored on windows machine
    "version": "1.3.3",

    "app_name": "LabCorp Phoenix",
    "app_description": "LabCorp Application",
    "manufacturer": "LabCorp Inc",

    //location of main.js and source files
    "source": "app",
    "development": "app",

    //build location of msi and wxs file
    "distribution": "build",

    //change electron.ext to exeName
    "exeName": "phoenix",

    //environment
    "STAGE": "https://stage-phoenix.labcorp.com/web-ui/",
    "UAT": "https://uat-phoenix.labcorp.com/web-ui/",
    "PROD": "https://phoenix.labcorp.com/web-ui/",
    "DEV": "https://dev-phoenix.labcorp.com/web-ui/",
    "QA": "https://qa-phoenix.labcorp.com/web-ui/",
    "LOCAL": "http://ken.labcorp.com:8080",
    "BETA": "https://qa-phoenix.labcorp.com/web-ui/",

    //hosting server setting and working environment
    "VERSION_SERVER": "https://dev-phoenix.labcorp.com/web-ui/", //hosting server for all the build packages
    "WORKING_ENVIRONMENT": "DEV", //environment to build on start up

    //environment where the build.json is goign to be stored for the working environment
    "versionFilePath": "/release/[WORKING_ENVIRONMENT]/build.json"

};

