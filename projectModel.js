const mongoose=require('mongoose');


const projectSchema = new mongoose.Schema(
    {
      title: { type: String, required: true },
      description: { type: String, required: true },
    },
    { timestamps: true }
  );
  
const projectModel=mongoose.model('Project',projectSchema)

module.exports={projectModel}