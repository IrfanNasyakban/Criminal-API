import express from "express"
import {
    getLogins,
    getLoginById,
    createLogin,
    updateLogin,
    deleteLogin
} from "../controllers/Login.js"
import { verifyUser, adminOnly } from "../middleware/AuthLogin.js"

const router = express.Router()

router.get('/admin', verifyUser, adminOnly, getLogins)
router.get('/admin/:id', verifyUser, adminOnly, getLoginById)
router.post('/admin', verifyUser, adminOnly, createLogin)
router.patch('/admin/:id', verifyUser, adminOnly, updateLogin)
router.delete('/admin/:id', verifyUser, adminOnly, deleteLogin)

export default router