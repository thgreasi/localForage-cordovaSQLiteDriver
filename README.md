# localForage-cordovaSQLiteDriver
[![npm](https://img.shields.io/npm/dm/localforage-cordovasqlitedriver.svg)](https://www.npmjs.com/package/localforage-cordovasqlitedriver)  
SQLite driver for [Cordova](https://cordova.apache.org/) apps using [localForage](https://github.com/mozilla/localForage).

## Requirements

* [Cordova](https://cordova.apache.org/)/[ionic](http://ionicframework.com/)
* [Cordova SQLite storage plugin](https://github.com/litehelpers/Cordova-sqlite-storage/) or [Cordova SQLite Plugin 2](https://github.com/nolanlawson/cordova-plugin-sqlite-2) or [Cordova SQLCipher adapter plugin](https://github.com/litehelpers/Cordova-sqlcipher-adapter)
* [localForage](https://github.com/mozilla/localForage) v1.5.0+
  * for localforage 1.4.x, please use the v1.5.0 release of this package
  * for even older versions of localforage, please use the v1.2.x releases


## Install Dependencies

* install Cordova-sqlite-storage plugin `cordova plugin add https://github.com/litehelpers/Cordova-sqlite-storage.git`
* install localForage-cordovaSQLiteDriver
  * via npm with: `npm i --save localforage localforage-cordovasqlitedriver` (ionic 2 users might prefer ths one)
  * via bower with: `bower install --save localforage localForage-cordovaSQLiteDriver`

#### Cordova-sqlcipher-adapter support
install the plugin by
```
cordova plugin add cordova-sqlcipher-adapter --save
```

Pass the key required by the database to localforage by passing a `dbKey` property to the [`.config()`](https://localforage.github.io/localForage/#settings-api-config) or [`.createInstance()`](https://localforage.github.io/localForage/#multiple-instances-createinstance) methods, or if using ionic-storage by passing `dbKey` via IonicStorageModule in your NgModule.

## CHANGELOG

### v1.7
Add support for cordova-sqlcipher-adapter. Thanks to @kohlia for PRing this.

### v1.6
Use localforage v1.5 & drop @types.

### v1.5
Add typescript typings.

### v1.4
Refactor to es6.

### v1.3
Reduce driver size (almost by 50%) by "inheriting" the method implementations of the `localforage.WEBSQL` driver.

### v1.2 *BREAKING CHANGE*
Add support for newer versions of [Cordova SQLite storage plugin](https://github.com/litehelpers/Cordova-sqlite-storage/) (v0.8.x  & v1.2.x).

*UPGRADE WARNING*: The default storage location for SQLite has changed in newer versions of [Cordova SQLite storage plugin](https://github.com/litehelpers/Cordova-sqlite-storage/). The new "`default`" location value is NOT the same as the old "`default`" location and will break an upgrade for an app that was using the old default value (0) on iOS. If you are upgrading to a newer version of `localForage-cordovaSQLiteDriver` you need to verify where your previous storage location was and update the `location` property of the localForage database. Otherwise the default is `'default'`. This is to avoid breaking the iCloud Design Guide. See [here](https://github.com/litehelpers/Cordova-sqlite-storage#important-icloud-backup-of-sqlite-database-is-not-allowed) for further details.

### v1.1
Try using the `getSerializer()` (available in localforage v1.3) as the prefered way to retrieve the serializer.

## Setup Your Project

* Include localforage and localForage-cordovaSQLiteDriver in your main html page, after the cordova include.
* Call `defineDriver` and `setDriver` to make localForage use the cordovaSQLiteDriver.

```html
<script src="cordova.js"></script>

<script src="lib/localforage/dist/localforage.js"></script>
<script src="lib/localForage-cordovaSQLiteDriver/dist/localforage-cordovasqlitedriver.js"></script>
<script>
localforage.defineDriver(window.cordovaSQLiteDriver).then(function() {
    return localforage.setDriver([
    	// Try setting cordovaSQLiteDriver if available,
      window.cordovaSQLiteDriver._driver,
      // otherwise use one of the default localforage drivers as a fallback.
      // This should allow you to transparently do your tests in a browser
      localforage.INDEXEDDB,
      localforage.WEBSQL,
      localforage.LOCALSTORAGE
    ]);
}).then(function() {
  // this should alert "cordovaSQLiteDriver" when in an emulator or a device
  alert(localforage.driver());
  // set a value;
  return localforage.setItem('testPromiseKey', 'testPromiseValue');
}).then(function() {
  return localforage.getItem('testPromiseKey');
}).then(function(value) {
  alert(value);
}).catch(function(err) {
  alert(err);
});
</script>
```

## Examples
* [Example Cordova/Ionic project](https://github.com/thgreasi/localForage-cordovaSQLiteDriver-TestIonicApp)
* [Example Ionic2/Angular2/Typescript project](https://github.com/thgreasi/localForage-cordovaSQLiteDriver-TestIonic2App)
