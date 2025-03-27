## Getting started with BeatDocs
Install the required dependencies then go to [google cloud's google auth platform](https://console.cloud.google.com/auth). From there create a new application of type "Web Application" and press create to create the application. Take your "Client ID" and paste it into manifest.json under the oath section where there is a key for "client_id". 

After run `npm run build` to create a new build

Then navigate to google chrome and go click the extensions button -> manage extensions(make sure dev mode is turned on) and click "Load Unpacked" and when prompted select your `/dist` directory created from npm run build.

---

To get started creating your own BeatDocs beats follow our format defined most simply in this happy birthday [DEMO](https://docs.google.com/document/d/145p90hCarBO9wXcDUkYpWqol_wNrXsG2OX2qOJD3A1c/edit?usp=sharing)

Here is what an example happy birthday beat looks like:
![](/imgs/HappyBirthday.png)

![](imgs/Happy%20Birthday%20Metadata.png)


Note that the first tab of the document must contain the music notes and the second tab of the document must contain the metadata

To look at more advanced BeatDocs features such as sampling external clips refer to our [examples google drive](https://drive.google.com/drive/folders/1gmuPhdt6Gst-D_7ibUeHW294JoXyR1KI?usp=drive_link)

Here is an example of a more complex BeatDocs Beat:
![](/imgs/AdvancedBeatDocs.png)
q
![](/imgs/AdvancedBeatDocMetadata.png)