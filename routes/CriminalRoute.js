import express from "express"
import {
    getCriminals,
    getCriminalById,
    createCriminal,
    updateCriminal,
    deleteCriminal
} from "../controllers/CriminalController.js"
import { verifyUser } from "../middleware/AuthLogin.js"

const router = express.Router()

router.get('/criminals', verifyUser, getCriminals)
router.get('/criminals/:id', verifyUser, getCriminalById)
router.post('/criminals', verifyUser, createCriminal)
router.patch('/criminals/:id', verifyUser, updateCriminal)
router.delete('/criminals/:id', verifyUser, deleteCriminal)

export default router