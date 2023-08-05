var {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
var { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
var axios = require("axios");
var FileType = require("file-type");
const fs = require("fs-extra");
var { StatusCodes } = require("http-status-codes");

// bucket name
var bucket = "quoded-cloud-data";
// connect with AWS Client
const s3Client = new S3Client({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});


// upload file to the server
exports.uploadFile = async (req, res) => {
  try {

    // get Login user data
    const userdata = req.user;

    if (req.files.length > 0 && req.files.length < 16) {
      let count = 0;
      const length = req.files.length;
      req.files.forEach(async (data) => {
        const file = data;

        const binaryData = fs.readFileSync(file.path);

        // Function to convert base64 to a Buffer
        /* function base64ToBuffer(base64String) {
              return Buffer.from(base64String, "base64");
            } */
        const imageBuffer = Buffer.from(binaryData, "hex");

        // Detect the file type from the binary data
        const fileTypeResult = await FileType.fromBuffer(imageBuffer);

        const command = new PutObjectCommand({
          // Bucket: 'testing125',
          Bucket: bucket,
          // Key: `/uploads/user-uploads/${filename}`,   / crearte new folder  / => uploads =>user-uploads
          // Key: `${userdata.id}/file-${Date.now()}.${fileTypeResult.ext}`,
          Key: `${userdata.id}/${file.filename.split(".")[0]}-${Date.now()}.${
            fileTypeResult.ext
          }`,
          // ContentType: contentType,
          ContentType: fileTypeResult ? fileTypeResult.mime : file.mimetype,
          // ContentType: file.mimetype,
        });

        const url = await getSignedUrl(s3Client, command);

        const config = {
          url,
          method: "put",
          data: binaryData,
          headers: {
            "Content-Type": "application/octet-stream", // Set the appropriate content type for your binary data
          },
        };

        // Send the request
        try {
          // const response = await axios(config);
          await axios(config);

          let paths = file.path;
          console.log(paths);
          // delete server store file after 30 Seconds
          setTimeout(function () {
            fs.unlink(paths, (err) => {
              if (err) {
                console.log(err);
                return;
              }
              console.log(`Deleted file: ${paths}`);
            });
          }, 30000);

          count++;
          if (length === count) {
            res.status(StatusCodes.OK).json({
              status: true,
              message: "file upload successfully",
            });
            return;
          }
        } catch (e) {
          res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
            status: "fail",
            message: "something went wrong",
            error: e,
          });
          return;
        }
      });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        status: "fail",
        message: "Plz select file or select max 15 files to upload",
      });
      return;
    }
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: "fail",
      message: "something went wrong",
      error: err,
    });
    return;
  }
};

// delete selected files
exports.deleteFile = async (req, res) => {
  try {
    const { filename } = req.body;

    // get Login user
    const userdata = req.user;

    const command = new DeleteObjectCommand({
      Bucket: bucket,
      // Key: `${userdata.id}/${filename.split('/')[1]}`,
      Key: filename,
      // Key: `ram.jpg`,
    });

    const result = await s3Client.send(command);

    if (result.$metadata.httpStatusCode === 204) {
      res.status(StatusCodes.OK).json({
        status: true,
        message: "File deleted successfully",
      });
      return;
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        status: "fail",
        message: "File deletetion failed",
      });
      return;
    }
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: "fail",
      message: "something went wrong",
      error: err,
    });
    return;
  }
};

// get login user all files
exports.getAllFiles = async (req, res) => {
  try {
    // get Login user
    const userdata = req.user;

    const command = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: `${userdata.id}`,
    });

    const result = await s3Client.send(command);

    if (result.Contents) {

      const totalSize = result.Contents.reduce((a, b) => a + b.Size, 0);

      const groups = {
        Images: [],
        Video: [],
        Audio: [],
        Documents: [],
      };

      // sorted the files
      result.Contents.forEach((item) => {
        const key = item.Key;
        const extension = key.split(".").pop().toLowerCase();

        if (
          ["jpg","jpeg","gif","png","bmp","svg","eps","pict","psd","tif","tga",
          ].includes(extension)
        ) {
          groups.Images.push(item);
        } else if (
          ["mp4","flv","avi","mov","dv","mpg","wma","wmv","swf","m4v","mxf",
          ].includes(extension)
        ) {
          groups.Video.push(item);
        } else if (["mp3", "aiff", "aac", "ac3", "m4a"].includes(extension)) {
          groups.Audio.push(item);
        } else {
          groups.Documents.push(item);
        }
      });

      res.status(StatusCodes.OK).json({
        status: true,
        message: "successfully",
        data_size: +parseFloat(totalSize / 1138576).toFixed(2) ,
        data: groups,
      });
      return;
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        status: "fail",
        message: "No data Found",
      });
      return;
    }
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: "fail",
      message: "something went wrong",
      error: err,
    });
    return;
  }
};

// get login user all files Folder Size
exports.getFolderFilesSize = async (req, res) => {
  try {
    // get Login user
    const userdata = req.user;

    const command = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: `${userdata.id}`,
    });

    const result = await s3Client.send(command);

    if (result.Contents) {
      const totalSize = result.Contents.reduce((a, b) => a + b.Size, 0);

      // const b2s=t=>{let e=Math.log2(t)/10|0;return(t/1024**(e=e<=0?0:e)).toFixed(3)+"BKMGP"[e]};
      // console.log(b2s(totalSize));

      res.status(StatusCodes.OK).json({
        status: true,
        message: "User File Folder Size in MB",
        size: +parseFloat(totalSize / 1138576).toFixed(2),
        // data:result.Contents
      });
      return;
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        status: "fail",
        message: "No data Found",
      });
      return;
    }
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: "fail",
      message: "something went wrong",
      error: err,
    });
    return;
  }
};

// Image Root Path https://quoded-cloud-data.s3.amazonaws.com/
