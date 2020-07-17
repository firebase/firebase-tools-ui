<div class="ds-selector-tabs" data-ds-scope="lang">
  <section>
    <h5>Android</h5>

```java
// 10.0.2.2 is the special IP address to connect to the 'localhost' of
// the host computer from an Android emulator.
// In almost all cases the ns (namespace) is your project ID.
FirebaseDatabase database = FirebaseDatabase.getInstance("http://10.0.2.2:9000?ns=YOUR_DATABASE_NAMESPACE");
```

</pre>
  </section>
  <section>
    <h5>iOS - Swift</h5>

```swift
// In almost all cases the ns (namespace) is your project ID.
let db = Database.database(url:@"http://localhost:9000?ns=YOUR_DATABASE_NAMESPACE")
```

  </section>
  <section>
    <h5>Web</h5>

```js
if (location.hostname === "localhost") {

  var firebaseConfig = {
    // Point to the RTDB emulator running on localhost.
    // In almost all cases the ns (namespace) is your project ID.
    databaseURL: "http://localhost:9000?ns=YOUR_DATABASE_NAMESPACE"
  }

  var myApp = firebase.initializeApp(firebaseConfig);
  var db = myApp.database();
}
```

  </section>
</div>
