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
    accessKeyId: "AKIATTW2PJIYPE753DAK",
    secretAccessKey: "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",
  },
});


// upload file to the server
exports.uploadFile = async (req, res) => {
  try {
    // get Login user
    const userdata = req.user;

    const binaryData = fs.readFileSync(req.file.path);

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
      Key: `${userdata.id}/file-${Date.now()}.${fileTypeResult.ext}`,
      // ContentType: contentType,
      ContentType: fileTypeResult ? fileTypeResult.mime : req.file.mimetype,
      // ContentType: req.file.mimetype,
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
      const response = await axios(config);

      let paths = req.file.path
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

      if (response.data === "") {
        res.status(StatusCodes.OK).json({
          status: true,
          message: "file upload successfully",
        });
        return;
      } else {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
          status: "fail",
          message: "file uploading error",
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
  try{
  // get Login user
  const userdata = req.user;

  const command = new ListObjectsV2Command({
    Bucket: bucket,
    Prefix: `${userdata.id}`,
  });

  const result = await s3Client.send(command);

  if(result.Contents){

    const groups = {
      Images: [],
      Video: [],
      Audio: [],
      Documents: [],
    };

    // sorted the files
    result.Contents.forEach(item => {
      const key = item.Key;
      const extension = key.split('.').pop().toLowerCase();
  
      if (['jpg', 'jpeg', 'gif','png'].includes(extension)) {
        groups.Images.push(item);
      } else if (['mp4', 'flv'].includes(extension)) {
        groups.Video.push(item);
      } else if (['mp3'].includes(extension)) {
        groups.Audio.push(item);
      } else {
        groups.Documents.push(item);
      }
    });

    res.status(StatusCodes.OK).json({
      status: true,
      message: "successfully",
      data : groups
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


// delete selected files
exports.deleteFile = async (req, res) => {
  try{
  const {filename} = req.body
  
  // get Login user
  const userdata = req.user;

  const command = new DeleteObjectCommand({
    Bucket: bucket,
    // Key: `${userdata.id}/${filename.split('/')[1]}`,
    Key: filename,
    // Key: `ram.jpg`,
  });

  const result = await s3Client.send(command);

  if(result.$metadata.httpStatusCode === 204){
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


// Image Root Path https://quoded-cloud-data.s3.amazonaws.com/