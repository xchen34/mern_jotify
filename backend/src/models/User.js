import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
     email: {type: String,required: true,trim: true, unique: true, index: true},
     passwordHash: {type: String, required: true},
     name:{type: String, required: true, trim: true, maxlength: 50},
},
{timestamps: true}
);


export default mongoose.model("User", userSchema);