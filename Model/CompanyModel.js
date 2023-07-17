const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);
// const mongoosePaginate = require('mongoose-paginate-v2');

/* 
const autoIncrement = require('mongoose-auto-increment');
// Add the auto-increment plugin to Mongoose
autoIncrement.initialize(mongoose.connection);
*/

const CompanySchema = new mongoose.Schema({
    _id: Number,
    name: {
      type: String,
    },
  }
);


// Apply the auto-increment plugin to the schema
/* CompanySchema.plugin(autoIncrement.plugin, {
    model: 'Company',
    field: 'id',
    startAt: 1, // Initial value for the counter
    incrementBy: 1 // Increment step
  });
*/


// CompanySchema.plugin(AutoIncrement);

CompanySchema.plugin(AutoIncrement, {id: "company_seq", inc_field: "_id" });

// CompanySchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Company", CompanySchema,"Company");