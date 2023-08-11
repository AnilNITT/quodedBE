const Project = require("../../../Model/ProjectModal");
const { StatusCodes } = require("http-status-codes");


// Add Project
exports.addProject = async (req, res) => {
  try {
    // get Login user data
    const userdata = req.user;

    if (userdata.role !== "Admin") {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        status: "fail",
        message: "You are not authorized to Add Project",
      });
      return;
    }

    const { name, description } = req.body;

    if (name === "") {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        status: "fail",
        message: "project Name can not be empty!!!",
      });
      return;
    }

    let data = await Project.findOne({ name });

    if (data) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        status: "fail",
        message: "Project Name Already Exists",
      });
      return;
    }

    let project = await Project({ name, description });
    await project.save();
    
    res.status(StatusCodes.OK).json({
      status: true,
      message: "Project Created Successfully",
      data: project,
    });
    return;
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: "fail",
      message: "something went wrong",
      error: err,
    });
    return;
  }
};


// Get All Project
exports.getAllProject = async (req, res) => {
    try {
      // get Login user data
      const userdata = req.user;
  
      if (userdata.role !== "Admin") {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
          status: "fail",
          message: "You are not authorized to Access this",
        });
        return;
      }
  
      let data = await Project.find(req.query);

      if (data.length == 0) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
          status: "fail",
          message: "No Project found",
        });
        return;
      }
  
      res.status(StatusCodes.OK).json({
        status: true,
        message: "Successfully",
        data: data,
      });
      return;
    } catch (err) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        status: "fail",
        message: "something went wrong",
        error: err,
      });
      return;
    }
};


// Get Single Project
exports.getProject = async (req, res) => {
    try {

      let data = await Project.findOne({id:req.params.id});

      if (!data) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
          status: "fail",
          message: "No Project found",
        });
        return;
      }
  
      res.status(StatusCodes.OK).json({
        status: true,
        message: "Successfully",
        data: data,
      });
      return;
    } catch (err) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        status: "fail",
        message: "something went wrong",
        error: err,
      });
      return;
    }
};


// delete Single Project
exports.deleteProject = async (req, res) => {
  try {

    let data = await Project.findById(req.params.id);

    if (!data) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        status: "fail",
        message: "No Project found to delete",
      });
      return;
    }

    await Project.findByIdAndDelete(req.params.id)

    res.status(StatusCodes.OK).json({
      status: true,
      message: "Project deleted successfully",
    });
    return;

  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: "fail",
      message: "something went wrong",
      error: err,
    });
    return;
  }
};


// Update Single Project
exports.updateProject = async (req, res) => {
  try {

    let data = await Project.findById(req.params.id);

    if (!data) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        status: "fail",
        message: "No Project found to delete",
      });
      return;
    }

    // update the Employee Data
    data = await Project.findByIdAndUpdate(req.params.id,req.body,{new:true});

    res.status(StatusCodes.OK).json({
      status: true,
      message: "Project updated successfully",
      data:data
    });
    return;

  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: "fail",
      message: "something went wrong",
      error: err,
    });
    return;
  }
};
