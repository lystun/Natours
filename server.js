const mongoose = require('mongoose')

const dotenv = require('dotenv');
dotenv.config({ path: './config.env' })

const app = require('./app')

const DB = process.env.DATABASE.replace('<password>', process.env.DATABASE_PASSWORD )
mongoose.connect(DB, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(con => console.log("DB Connection Successful"))
    .catch(err => console.log(err.message))

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Natours listening on port ${port}!`))

process.on('unhandledRejection', err => {
    console.log(err.name, err.message);
    
    server.close(() => {
        process.exit(1)
    })
})