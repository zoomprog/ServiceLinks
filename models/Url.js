import {Schema, model} from "mongoose";

shortID.configure({
    length: 5,
    algorithm: "sha1",
    salt: Math.random(),
})
const urlSchema = new Schema({
    url:{
        type: String,
        required: true,
    },
    short_url:{
        type: String,
        required: true,
        default: shortID.generate,
    },
    clicks:{
        type: Number,
        required: true,
        default: 0,
    },
}, {timestamps: true});

const Url = mongoose.model('Url', urlSchema);

export default model('Url', urlSchema);