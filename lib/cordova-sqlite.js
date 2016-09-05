/* global document, sqlitePlugin */
// we can't import this, since it gets defined later
// import sqlitePlugin from 'sqlitePlugin';

export var deviceReady = new Promise(function(resolve, reject) {
    if (typeof sqlitePlugin !== 'undefined') {
        resolve();
    } else if (typeof cordova === 'undefined') {
        reject(new Error('cordova is not defined.'));
    } else {
        // Wait for Cordova to load
        document.addEventListener("deviceready", () => resolve(), false);
    }
});

var deviceReadyDone = deviceReady.catch(() => Promise.resolve());

export function getOpenDatabasePromise () {
    return deviceReadyDone.then(function() {
        if (typeof sqlitePlugin !== 'undefined' &&
            typeof sqlitePlugin.openDatabase === 'function') {
            return sqlitePlugin.openDatabase;
        } else {
            throw new Error('SQLite plugin is not present.');
        }
    });
}
