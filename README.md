## Getting started with BeatDocs
Install the required dependencies then go to [google cloud's google auth platform](https://console.cloud.google.com/auth). From there create a new application of type "Web Application" and press create to create the application. Take your "Client ID" and paste it into manifest.json under the oath section where there is a key for "client_id". 

After run `npm run build` to create a new build

Then navigate to google chrome and go click the extensions button -> manage extensions(make sure dev mode is turned on) and click "Load Unpacked" and when prompted select your `/dist` directory created from npm run build.
