const mongoose = require('mongoose');
const { Schema } = mongoose;

const fileSchema = new Schema(
    {
        owner: { type: mongoose.Schema.Types.ObjectId, require: true, ref: "Client" },
        title: { type: String, require: true },
        type: { type: String, require: true },
        refer: { type: String, require: true },
        fileName: { type: String, require: true },
        fileType: { type: String, require: true },
        filePath: { type: String, require: true },
    },
    {
        timestamps: true
    }
)

const File = mongoose.model('File', fileSchema)
module.exports = File