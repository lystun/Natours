const mongoose = require('mongoose');
const validator = require('validator');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

const userSchema = mongoose.Schema({
    name : {
        type: String,
        required : [true, 'Please enter your name']
    },
    email : {
        type: String,
        required : [true, "Please provide your email"],
        unique: true,
        lowercase: true,
        validate: [ validator.isEmail, 'Please provide a valid email' ]
    },
    photo: {
        type: String,
        default: 'default.jpg'
    },
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    password : {
        type: String,
        required : [true, "Please provide a password"],
        minLenigth: 8,
        select: false
    },
    passwordConfirm : {
        type: String,
        required : [true, "Please confirm your password"],
        validate: {
            validator: function(el){
                return el === this.password
            },
            message: "Passwords do not match"
        }
    },
    passwordChangedAt: Date,
    passwordResetToken : String,
    passwordResetExpires : String,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
})

// query middlewares
userSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next()
    
    this.password = await bcrypt.hash(this.password, 12)
    this.passwordConfirm = undefined
    next()
});

userSchema.pre('save', function(next){
    if(!this.isModified('password') || this.isNew ) return next()

    this.passwordChangedAt = Date.now() - 1000
    next()
})

userSchema.pre(/^find/, function(next){
    this.find({ active: {$ne: false} })
    next()
})


//Instance methods
userSchema.methods.correctPassword = async function(candidatePasword, userPassword){
    return await bcrypt.compare(candidatePasword, userPassword)
}

userSchema.methods.changedPasswordAfter = async function(JWTTimestamp){
    if(this.passwordChangedAt){
        const changedTimesstamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10)
        return JWTTimestamp > changedTimesstamp
    }

    return false
}

userSchema.methods.createPasswordResetToken = function(){

    const resetToken = crypto.randomBytes(32).toString('hex')

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    this.passwordResetExpires = Date.now() + 10*60*1000

    return resetToken;
}

const User = mongoose.model('User', userSchema)

module.exports = User