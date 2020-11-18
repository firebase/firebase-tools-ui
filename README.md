# Firebase Emulator UI

The web UI for Firebase Emulator Suite. Features include:

- Overview of Emulators running
- Firebase Realtime Database Data Viewer/Editor
- Cloud Firestore Data Viewer/Editor
- Logs Viewer with powerful filters

More on the [blog post](https://firebase.googleblog.com/2020/05/local-firebase-emulator-ui.html)!

## Usage

If you want to use the Emulator UI in your project, just simply follow the guide for [installing and running the Emulator Suite](https://firebase.google.com/docs/emulator-suite/install_and_configure).

Make sure you have Firebase CLI `>= 8.4.0`. (You may want to [update](https://firebase.google.com/docs/cli#update-cli) if you already have Firebase CLI installed.) The Emulator UI will automatically start when you start the Emulator Suite.

## Contributing

We welcome any issues and Pull Requests to improve the Emulator UI. The following instructions cover how to set up your dev environment for iterating on the Emulator UI itself.

(If you're looking forward to use the Emulator UI as a user, please refer to the Usage section above.)

### Start the Development Server

To run the development server with test data:

```bash
firebase emulators:exec --project sample --only database,firestore --import test-data 'npm start'
```

This will run the web app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

NOTE: The `emulators:exec` command is necessary to set the environment variables for the web app to talk to emulators.

### Developing within a user project

You can also start the dev server of the Emulator UI and connect to your real project. To do so, first start the Emulator Suite in your project folder:

```bash
cd project/
firebase emulators:start --import my-data

✔  hub: emulator hub started at http://localhost:4400
```

This will run the emulators for your project.<br />

In another terminal, run the Emulator Suite UI from the firebase-tools-ui folder: (note that `<project-id>` must be replaced with the matching project id of your project.)

```
cd firebase-tools-ui/
GCLOUD_PROJECT=<project-id> FIREBASE_EMULATOR_HUB=localhost:4400 npm start
```

Open [http://localhost:3000](http://localhost:3000) to view it in the browser. Note: The development server runs by default on port **3000**, so please make sure you are visiting that URL instead of the production Emulator UI (which defaults on port **4000**).

### Other Available Scripts

In the project directory, you can run:

#### `npm test`

Launches the test runner in the interactive watch mode.

See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

To run the test runner with emulators, use:

```bash
firebase emulators:exec --project sample --only firestore 'npm test'
```

If you get port conflict errors, make sure to stop other instances of the Firebase Emulator Suite (e.g. the one you've started for the development server above) and try again.

#### `npm run build`

Builds the app for production, both server and web.

The web production build will be output to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.
The build is minified and the filenames include the hashes.<br />

The server code will be packed into `server.bundle.js`, which is a standalone
JS file including all dependencies, ready for execution with Node.js.

To run the production build with emulators, use:

```bash
firebase emulators:exec --project sample --only database,firestore --import test-data 'PORT=3000 node server.bundle.js'
```

This will start a server that serves both the static files and APIs at `http://localhost:3000/`.

NOTE: The static files are not meant to be deployed to a website or CDN. They must be used in conjunction with
the server as described above.

## License

Apache 2.0
