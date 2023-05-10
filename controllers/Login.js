import Login from "../models/LoginModel.js"
import argon from "argon2"

export const getLogins = async(req, res) => {
    try {
        const response = await Login.findAll({
            attributes: ['uuid', 'name', 'email', 'role']
        })
        res.status(200).json(response)
    } catch (error) {
        res.status(500).json({msg: error.message})
    }
}

export const getLoginById = async(req, res) => {
    try {
        const response = await Login.findOne({
            attributes: ['uuid', 'name', 'email', 'role'],
            where: {
                uuid: req.params.id
            }
        })
        res.status(200).json(response)
    } catch (error) {
        res.status(500).json({msg: error.message})
    }
}

export const createLogin = async(req, res) => {
    const {name, email, password, confPassword, role} = req.body
    if (password !== confPassword) return res.status(400).json({msg: "Password dan confirm password tidak cocok"})
    const hashPassword = await argon.hash(password)
    try {
        await Login.create({
            name: name,
            email: email,
            password: hashPassword,
            role: role
        })
        res.status(201).json({msg: "Register berhasil"})
    } catch (error) {
        res.status(400).json({msg: error.message})
    }
}

export const updateLogin = async(req, res) => {
    const login = await Login.findOne({
        where: {
            uuid: req.params.id
        }
    })
    if (!login) return res.status(404).json({msg: "User tidak ditemukan"})
    const {name, email, password, confPassword, role} = req.body
    let hashPassword
    if (password === "" || password === null) {
        hashPassword = login.password
    } else {
        hashPassword = await argon.hash(password)
    }
    if (password !== confPassword) return res.status(400).json({msg: "Password dan confirm password tidak cocok"})
    try {
        await Login.update({
            name: name,
            email: email,
            password: hashPassword,
            role: role
        }, {
            where:{
                id: login.id
            }
        })
        res.status(200).json({msg: "User Updated"})
    } catch (error) {
        res.status(400).json({msg: error.message})
    }
}

export const deleteLogin = async(req, res) => {
    const login = await Login.findOne({
        where: {
            uuid: req.params.id
        }
    })
    if (!login) return res.status(404).json({msg: "User tidak ditemukan"})
    try {
        await Login.destroy({
            where:{
                id: login.id
            }
        })
        res.status(200).json({msg: "User Deleted"})
    } catch (error) {
        res.status(400).json({msg: error.message})
    }
}