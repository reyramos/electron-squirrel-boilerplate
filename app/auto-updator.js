/**
 * Created by ramor11 on 10/28/2016.
 */
module.exports = function(autoUpdater){



    autoUpdater.on('error', function (err) {
        var msg = "An error has occurred while checking for updates " + err.message;
        console.log('error =>', msg)
        //
        // if (manualCheck) {
        //     // if (splashWindow) {
        //     //     splashWindow.webContents.send('update-error', msg);
        //     // } else if (mainWindow) {
        //     //     mainWindow.webContents.send('update-error', msg);
        //     // }
        // }
    });

    autoUpdater.on('checking-for-update', function () {
        console.log('checking-for-update');
    });

    autoUpdater.on('update-available', function () {
        console.log('update-available')

        // if(splashWindow) {
        //     updateAvailable = true;
        //     isValid = true;
        //     splashWindow.close();
        // }
    });

    autoUpdater.on('update-not-available', function () {
        console.log('update-not-available')

        // if (mainWindow && manualCheck) {
        //     mainWindow.webContents.send('no-update');
        // } else if(splashWindow) {
        //     isValid = true;
        //     splashWindow.close();
        // }
    });

    autoUpdater.on('update-downloaded', function () {
        console.log('update-downloaded')

        // if(splashWindow) {
        //     splashWindow.webContents.send('update-ready');
        // } else if (mainWindow) {
        //     mainWindow.webContents.send('update-ready');
        // }
        // updateReady = true;
    });
}