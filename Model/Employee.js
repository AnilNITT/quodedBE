var mongoose = require('mongoose');


// Define the employee collection schema
var employeeSchema = new mongoose.Schema({
    C_Id: { 
        type: mongoose.Schema.Types.Number, 
        ref: 'Company' , 
    },
    user_id: { 
        type: mongoose.Schema.Types.Number, 
        ref: 'users' , 
    },
    employee_name:{
        type:String, 
    },
    company_emp_id:{
        type:String, 
    },
    job_profile:{
        type:String, 
    },
    company_email:{
        type:String, 
    },
    company_phone:{
        type:String, 
    },
    project_id:{
        type:String, 
    },
},
{ 
    timestamps: true 
}
);

module.exports = mongoose.model('Employee', employeeSchema, "Employee");