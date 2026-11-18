const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, 'Username is required'],
            unique: true,
            trim: true,
            minLength: 2,
            maxLength: 20,
            validate: {
                validator: function (value) {
                    return /^[a-zA-Z0-9_]+$/.test(value);
                },
                message: function (props) {
                    return `${props.value} is not a valid username`;
                }
            }
        },
        role: {
            type: String,
            enum: ['admin', 'player'],
            default: 'player'
        },
        hashedPassword: {
            type: String,
            required: true
        }
    },
    { collection: 'users' }
);

// Virtueel veld: "password" wordt NIET opgeslagen.
// Bij new User({ password: 'abc123' }) wordt deze functie uitgevoerd
// en slaan we alleen de hash op in hashedPassword.
userSchema.virtual('password').set(function (password) {
    password = password.trim();
    if (password.length < 6) {
        this.invalidate('password', 'must be at least 6 characters.');
    }
    if (password.length > 20) {
        this.invalidate('password', 'must be shorter than 20 characters.');
    }
    //bcrypt.hashSync(plainPassword, saltRounds);
    this.hashedPassword = bcrypt.hashSync(password, 10);
});

// Statische functie op het model: User.findOneByCredentials(...), find user
userSchema.statics.findOneByCredentials = async function (username, password) {
    const user = await this.findOne({ username: username });
    if (!user) {
        return null;
    }
    const passwordIsCorrect = await bcrypt.compare(password, user.hashedPassword);
    if (!passwordIsCorrect) {
        return null;
    }
    return user;
};

module.exports = mongoose.model('User', userSchema);