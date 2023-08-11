const mongoose = require("mongoose");
const autoIncrement = require('mongoose-plugin-autoinc');

const ProjectSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
  },
  {
    timestamps: true,
  }
);

// Apply the auto-increment plugin to the schema
ProjectSchema.plugin(autoIncrement.plugin, {
  model: 'Project',
  field: 'id',
  startAt: 1,
  incrementBy: 1
});

// ProjectSchema.plugin(AutoIncrement);
// ProjectSchema.plugin(AutoIncrement, { id: "project_seq", inc_field: "id" });

module.exports = mongoose.model("Project", ProjectSchema, "Project");
