Note: The Cloud Firestore emulator clears database contents when shut down. Since
the offline cache of the Firestore SDK is not automatically cleared, you may
want to disable local persistence in your emulator configuration to avoid
discrepancies between the emulated database and local caches; in the Web SDK,
persistence is disabled by default.

<div class="ds-selector-tabs" data-ds-scope="lang">
  <section>
    <h5>Android</h5>

```java
// 10.0.2.2 is the special IP address to connect to the 'localhost' of
// the host computer from an Android emulator.
FirebaseFirestoreSettings settings = new FirebaseFirestoreSettings.Builder()
        .setHost("10.0.2.2:8080")
        .setSslEnabled(false)
        .setPersistenceEnabled(false)
        .build();

FirebaseFirestore firestore = FirebaseFirestore.getInstance();
firestore.setFirestoreSettings(settings);
```

  </section>
  <section>
    <h5>iOS - Swift</h5>

```swift
let settings = Firestore.firestore().settings
settings.host = "localhost:8080"
settings.isPersistenceEnabled = false
settings.isSSLEnabled = false
Firestore.firestore().settings = settings
```

  </section>
  <section>
    <h5>Web</h5>
Initialize your Web app as described in the <a href="/docs/web/setup#add-sdks-initialize">Get started for Web</a>, and then:

```js
var db = firebaseApp.firestore();
if (location.hostname === 'localhost') {
  db.settings({
    host: 'localhost:8080',
    ssl: false,
  });
}
```

  </section>
</div>
