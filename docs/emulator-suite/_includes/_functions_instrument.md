### Callable Functions

If your prototype and test activities involve [callable backend functions](https://firebase.google.com/docs/functions/callable), configure interaction with the Cloud Functions for Firebase emulator like this:

<div class="ds-selector-tabs" data-ds-scope="lang">
  <section>
    <h5>Android</h5>

```java
FirebaseFunctions.getInstance().useFunctionsEmulator("http://10.0.2.2:5001");
```

  </section>
  <section>
    <h5>iOS - Swift</h5>

```swift
Functions.functions().useFunctionsEmulator(origin: "http://localhost:5001")
```

  </section>
  <section>
    <h5>Web</h5>

```js
firebase.functions().useFunctionsEmulator("http://localhost:5001")
```

  </section>
</div>

Note: **Android only**. Android network security configuration policies may affect
how your code interacts with the Cloud Functions emulator, which serves data locally via
unencrypted HTTP. Starting with Android 9 (API level 28), clear text communication
is disabled by default. You can set up a `network_security_config.xml` file to
allow connecting to localhost to develop with Cloud Functions emulator. See the relevant
[Android developer documentation](https://developer.android.com/training/articles/security-config#CleartextTrafficPermitted).

### HTTPS Functions

Each HTTPS function in your code will be served from the local emulator using the following URL format:

<code>http://<var>$HOST</var>:<var>$PORT</var>/<var>$PROJECT</var>/<var>$REGION</var>/<var>$NAME</var></code>

For example a simple `helloWorld` function with the default host port and region would be served at:

<code>https://localhost:5001/<var>$PROJECT</var>/us-central1/helloWorld</code>
