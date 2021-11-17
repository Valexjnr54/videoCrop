const express = require("express");
const bodyParser = require("body-parser");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const { exec } = require("child_process");


const fileUpload = require("express-fileupload");

const app = express();



const PORT = process.env.PORT || 5000

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended:  false}));

// parse application/json
app.use(bodyParser.json());

//support parsing of application/x-www-form-urlencoded post data

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.post("/api/v1", (req, res) => {

  let from = req.body.timeFrom;
  let to = req.body.timeTo;
  let file = req.files.file;

  file.mv("tmp/" + file.name, function (err) {
    if (err) return res.sendStatus(500).send(err);
    console.log("File Uploaded successfully");

    var outputFilePath = Date.now() + "_crop_"+ file.name;

    exec(
      `ffmpeg -ss ${from} -i ${"tmp/" + file.name} -t ${to} -c copy ${outputFilePath}`,
      (error, stdout, stderr) => {
        if (error) {
          console.log(`error: ${error.message}`);
          return;
        } else {
          console.log("Video are successfully Cropped");
          res.download(outputFilePath, (err) => {
            if (err) throw err;

            // req.files.forEach((file) => {
            //   fs.unlinkSync(file.path);
            // });
            fs.unlink("tmp/" + file.name, function (err) {
              if (err) throw err;
              console.log("File deleted");
            });

            // fs.unlinkSync(listFilePath);
            fs.unlinkSync(outputFilePath);
          });
        }
      }
    );

  });
    
});

app.listen(PORT);
