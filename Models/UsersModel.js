import mongoose from "mongoose"

const {Schema} = mongoose

const userSchema = new Schema(
    {
        username: {
            type: String,
            require: true,
            unique: true,
            trim: true
        },
        password: {
            type: String,
            require: true,
            trim: true
        },
        password2: {
            type: String,
            require: true,
            trim: true
        },
        first_name: {
            type: String,
            require: true,
            trim: true
        },
        last_name: {
            type: String,
            require: true,
            trim: true
        },
        email: {
            type: String,
            unique: true,
            trim: true
        },
    },
    {
        timestamps: true
    }
)

const UsersModel = mongoose.model('UsersModel', userSchema)

export default UsersModel