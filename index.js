import express from "express"
import FileUpload from "express-fileupload"
import cors from "cors"
import CriminalRouter from "./routes/CriminalRoute.js"
import session from "express-session"
import dotenv from "dotenv"
import db from "./config/database.js"
import SequelizeStore from "connect-session-sequelize"
import LoginRoute from "./routes/LoginRoute.js"
import AuthRoute from "./routes/AuthRoute.js"
dotenv.config()

const app = express();

const sessionStore = SequelizeStore(session.Store)

const store = new sessionStore({
    db: db
})

// (async () => {
//     await db.sync()
// })()

app.use(cors({
    credentials: true,
    origin: 'http://localhost:3000'
}))
app.use(session({
    secret: process.env.SESS_SECRET,
    resave: false,
    saveUninitialized: true,
    store: store,
    cookie: {
        secure: 'auto'
    }
}))
app.use(express.json())
app.use(FileUpload())
app.use(express.static("public"))
app.use(CriminalRouter)
app.use(LoginRoute)
app.use(AuthRoute)

// store.sync()

app.listen(process.env.APP_PORT, ()=> {
    console.log('server up and running in http://localhost:5000')
})