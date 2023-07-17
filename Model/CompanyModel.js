const mongoose = require('mongoose');
const autoIncrement = require('mongoose-plugin-autoinc');

// Your Mongoose schema definition
const companySchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    }
},{
    timestamps:true,
});

// Apply the auto-increment plugin to the schema
companySchema.plugin(autoIncrement.plugin, {
  model: 'Company',
  field: 'id',
  startAt: 1,
  incrementBy: 1
});

module.exports = mongoose.model('Company', companySchema,"Company");