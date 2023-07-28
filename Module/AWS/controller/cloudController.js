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

// bucket name
var bucket = "quoded-cloud-data";

const s3Client = new S3Client({
  region: "us-east-1",
  credentials: {
    accessKeyId: "AKIATTW2PJIYPE753DAK",
    secretAccessKey: "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",
  },
});

exports.uploadFile = async (req, res) => {
  // get Login user
  // const userdata = req.user;
  const binaryData = req.body;
  console.log("hi");

  console.log(binaryData);
  // console.log(req.file);

  // Function to convert base64 to a Buffer
  /* function base64ToBuffer(base64String) {
    return Buffer.from(base64String, "base64");
  } */

  /*   const imageBuffer = Buffer.from(binaryData, "hex")

  // Detect the file type from the binary data
  const fileTypeResult =await FileType.fromBuffer(imageBuffer);

  console.log(fileTypeResult);

  if (fileTypeResult) {
    console.log("Detected file type:", fileTypeResult.mime);
  } else {
    console.log("File type detection failed.");
  } */

  /*  const command = new PutObjectCommand({
    // Bucket: 'testing125',
    Bucket: bucket,
    // Key: `/uploads/user-uploads/${filename}`,   / crearte new folder  / => uploads =>user-uploads
    Key: `${userdata.id}/image-${Date.now()}.${fileTypeResult.ext}`,
    // ContentType: contentType,
    ContentType: fileTypeResult.mime,
  });

  const url = await getSignedUrl(s3Client, command);

  const config = {
    url,
    method: "put",
    data: binaryData,
    headers: {
      "Content-Type": "application/octet-stream", // Set the appropriate content type for your binary data
    },
  }; */

  // Send the request
  // try {
    // const response = await axios(config);
    res.send({
      status: true,
      message: "file upload successfully",
    });
  /* } catch (e) {
    res.send({
      status: "fail",
      message: "something went wrong",
      error: e,
    });
  } */
};


exports.uploadData = async (req, res) => {
    console.log("hi");
    console.log(req.file);
    
    res.send({
        status: true,
        message: "file upload successfully",
    })
  };
  