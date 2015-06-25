# localForage-cordovaSQLiteDriver

SQLite driver [Cordova](https://cordova.apache.org/) apps using [localForage](https://github.com/mozilla/localForage).

## requirements

* [Cordova](https://cordova.apache.org/)/[ionic](http://ionicframework.com/)
* [Cordova SQLite storage plugin](https://github.com/litehelpers/Cordova-sqlite-storage/)
* [localForage](https://github.com/mozilla/localForage) v1.1.1+

## install dependencies

* install Cordova-sqlite-storage plugin `cordova plugin add https://github.com/litehelpers/Cordova-sqlite-storage.git`
* install localForage-cordovaSQLiteDriver `bower install --save localForage-cordovaSQLiteDriver`

## setup your project

* Include localforage and localForage-cordovaSQLiteDriver in your main html page, after the cordova include.
* Call `defineDriver` and `setDriver` to make localForage use the cordovaSQLiteDriver.

```html
<script src="cordova.js"></script>

<script src="lib/localforage/dist/localforage.js"></script>
<script src="lib/localForage-cordovaSQLiteDriver/src/localforage-cordovasqlitedriver.js"></script>
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
