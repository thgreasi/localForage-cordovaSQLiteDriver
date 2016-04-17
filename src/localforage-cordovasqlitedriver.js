/*
 * Includes code from:
 *
 * localForage - websql driver
 * https://github.com/mozilla/localforage
 *
 * Copyright (c) 2015 Mozilla
 * Licensed under Apache 2.0 license.
 *
 */
(function() {
    'use strict';

    var globalObject = this;

    // // If cordova is not present, we can stop now.
    // if (!globalObject.cordova) {
    //     return;
    // }

    var ModuleType = {
        DEFINE: 1,
        EXPORT: 2,
        WINDOW: 3
    };

    // Attaching to window (i.e. no module loader) is the assumed,
    // simple default.
    var moduleType = ModuleType.WINDOW;

    // Find out what kind of module setup we have; if none, we'll just attach
    // localForage to the main window.
    if (typeof module !== 'undefined' && module.exports && typeof require !== 'undefined') {
        moduleType = ModuleType.EXPORT;
    } else if (typeof define === 'function' && define.amd) {
        moduleType = ModuleType.DEFINE;
    }

    // Promises!
    var Promise = (moduleType === ModuleType.EXPORT) ?
                  require('promise') : this.Promise;

    var deviceReady = new Promise(function(resolve, reject) {
        if (globalObject.sqlitePlugin) {
            resolve();
        } else if (!globalObject.cordova) {
            reject();
        } else {
            // Wait for Cordova to load
            document.addEventListener("deviceready", resolve, false);
        }
    });

    var openDatabasePromise = deviceReady.catch(Promise.resolve).then(function() {
        return new Promise(function(resolve, reject) {
            var sqlitePlugin = sqlitePlugin || globalObject.sqlitePlugin;
            var openDatabase = sqlitePlugin && sqlitePlugin.openDatabase;

            if (typeof openDatabase === 'function') {
                resolve(openDatabase);
            } else {
                reject('SQLite plugin is not present.');
            }
        });
    });

    function getSerializerPromise(localForageInstance) {
        if (getSerializerPromise.result) {
            return getSerializerPromise.result;
        }
        if (!localForageInstance || typeof localForageInstance.getSerializer !== 'function') {
            Promise.reject(new Error(
                'localforage.getSerializer() was not available! ' +
                'localforage-cordovasqlitedriver required localforage v1.4+'));
        }
        getSerializerPromise.result = localForageInstance.getSerializer();
        return getSerializerPromise.result;
    }

    function getWebSqlDriverPromise(localForageInstance) {
        if (getWebSqlDriverPromise.result) {
            return getWebSqlDriverPromise.result;
        }
        if (!localForageInstance || typeof localForageInstance.getDriver !== 'function') {
            Promise.reject(new Error(
                'localforage.getDriver() was not available! ' +
                'localforage-cordovasqlitedriver requires localforage v1.4+'));
        }
        getWebSqlDriverPromise.result = localForageInstance.getDriver(localForageInstance.WEBSQL);
        return getWebSqlDriverPromise.result;
    }

    // Open the cordova sqlite plugin database (automatically creates one if one didn't
    // previously exist), using any options set in the config.
    function _initStorage(options) {
        var self = this;
        var dbInfo = {
            db: null
        };

        if (options) {
            for (var i in options) {
                dbInfo[i] = typeof(options[i]) !== 'string' ?
                            options[i].toString() : options[i];
            }
        }

        var dbInfoPromise = openDatabasePromise.then(function(openDatabase){
            return new Promise(function(resolve, reject) {
                // Open the database; the openDatabase API will automatically
                // create it for us if it doesn't exist.
                try {
                    dbInfo.location = dbInfo.location || 'default';
                    dbInfo.db = openDatabase({
                        name: dbInfo.name,
                        version: String(dbInfo.version),
                        description: dbInfo.description,
                        size: dbInfo.size,
                        location: dbInfo.location
                    });
                } catch (e) {
                    reject(e);
                }

                // Create our key/value table if it doesn't exist.
                dbInfo.db.transaction(function(t) {
                    t.executeSql('CREATE TABLE IF NOT EXISTS ' + dbInfo.storeName +
                                 ' (id INTEGER PRIMARY KEY, key unique, value)', [],
                                 function() {
                        self._dbInfo = dbInfo;
                        resolve();
                    }, function(t, error) {
                        reject(error);
                    });
                });
            });
        });

        var serializerPromise = getSerializerPromise(self);
        var webSqlDriverPromise = getWebSqlDriverPromise(self);

        return Promise.all([
            serializerPromise,
            webSqlDriverPromise,
            dbInfoPromise
        ]).then(function(results) {
            dbInfo.serializer = results[0];
            return dbInfoPromise;
        });
    }

    var cordovaSQLiteDriver = {
        _driver: 'cordovaSQLiteDriver',
        _initStorage: _initStorage,
        _support: function() {
            return openDatabasePromise.then(function(openDatabase) {
                return !!openDatabase;
            }).catch(function(){ return false; });
        }
    };

    function wireUpDriverMethods(driver) {
        var LibraryMethods = [
            'clear',
            'getItem',
            'iterate',
            'key',
            'keys',
            'length',
            'removeItem',
            'setItem'
        ];

        function wireUpDriverMethod(driver, methodName) {
            driver[methodName] = function () {
                var localForageInstance = this;
                var args = arguments;
                return getWebSqlDriverPromise(localForageInstance).then(function (webSqlDriver) {
                    return webSqlDriver[methodName].apply(localForageInstance, args);
                });
            };
        }

        for (var i = 0, len = LibraryMethods.length; i < len; i++) {
            var methodName = LibraryMethods[i];
            wireUpDriverMethod(driver, LibraryMethods[i]);
        }
    }

    wireUpDriverMethods(cordovaSQLiteDriver);

    if (moduleType === ModuleType.DEFINE) {
        define('cordovaSQLiteDriver', function() {
            return cordovaSQLiteDriver;
        });
    } else if (moduleType === ModuleType.EXPORT) {
        module.exports = cordovaSQLiteDriver;
    } else {
        this.cordovaSQLiteDriver = cordovaSQLiteDriver;
    }
}).call(window);
