# Phobia Extension App

This project is a chrome extension that deals with possible sensible pictures into the page content.
It will proccess the images contents with AI(YOLO V8) to detect sensible photos for persons with phobias.
The AI object detector project is in another directory.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

The project is divided into front-end (appFront) and back-end (appBack). Inside them you can run:

### appFront

On the root folder, run:

```console
cd appFrond
```

#### `npm start`

Runs the app in the development mode.\
This command will shows the chrome popup jsx page.
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

![image](https://github.com/GabrielOnohara/phobia-extension-app/assets/64387740/baab394f-ced2-4981-a27c-94d52f5d2acb)

#### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

This command will build the entire extension project, the background, content and popup files
To use this extension locally, you have to load the project directory in chrome web extension store after runs run build. You just have to enable developer mode, to allow store accept your own local project.

![image](https://github.com/GabrielOnohara/phobia-extension-app/assets/64387740/c9890488-c466-4251-9b97-d980e9232dc4)

### appBack

On the root folder, run:

```console
cd appBack
```

#### flask --app .\app.py run

Runs the Flask application, which receives the image links through a JSON and processes each one with a YOLOv8 model.

## Extensions code summary

### Manifest.json

Extensions code starts with the manifest file that will set up all the permitions and funcionalities.
After setting up the manifest.json, you can see the chrome officical documentation to explore a lot of tools to your app.

Open [Google Chrome Tabs Official documentation.](https://developer.chrome.com/docs/extensions/).

### Files

The extensions work with three sorts of file.

#### Content file

This filetype will deal with each content html data. All content processing code must be writted in this file.

#### Background file

This filetype will runs parallel to the browser window. It serves to communicate between other files, because it will be enable all time to handle with tabs messages, internal logical verifications and another type of control funcionality

#### Popup file

This file type will represent the main extension page, that displays when we click in the extension icon, on the top in browser tools.
It serves to a lot of funcionalities, but the principal objective is to be the extension visual panel.
