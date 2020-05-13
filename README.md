# Firebase Emulator UI

The web UI for Firebase Emulator Suite. Features include:

- Overview of Emulators running
- Firebase Realtime Database Data Viewer/Editor
- Cloud Firestore Data Viewer/Editor
- Logs Viewer with powerful filters

## Development

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

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Other Available Scripts

In the project directory, you can run:

#### `npm test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

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

This is not an official Google product.
