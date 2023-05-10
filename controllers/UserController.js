import user from "../models/UserModel.js";
import Login from "../models/LoginModel.js"
import path from "path"
import fs from "fs"
import { Op } from "Sequelize"
import { response } from "express";

export const getUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 0
        const limit = parseInt(req.query.limit) || 10
        const search = req.query.search_query || ""
        const offset = limit * page

        if (req.role === "admin") {
            const totalRows = await user.count({
                where: {
                    [Op.or]: [{
                        nama: {
                            [Op.like]: '%' + search + '%'
                        }
                    }, {
                        tindakan: {
                            [Op.like]: '%' + search + '%'
                        }
                    }]
                }
            })
            const totalPage = Math.ceil(totalRows / limit)
            const result = await user.findAll({
                attributes: ['uuid', 'nama', 'gender', 'tindakan', 'image', 'url'],
                include: [{
                    model: Login,
                    attributes: ['name', 'email', 'role']
                }],
                where: {
                    [Op.or]: [{
                        nama: {
                            [Op.like]: '%' + search + '%'
                        }
                    }, {
                        tindakan: {
                            [Op.like]: '%' + search + '%'
                        }
                    }]
                },
                offset: offset,
                limit: limit,
                order: [
                    ['id', 'DESC']
                ]
            })
            res.json({
                result: result,
                page: page,
                limit: limit,
                totalRows: totalRows,
                totalPage: totalPage
            })
        } else {
            const totalRows = await user.count({
                where: {
                    userId: req.userId,
                    [Op.or]: [{
                        nama: {
                            [Op.like]: '%' + search + '%'
                        }
                    }, {
                        tindakan: {
                            [Op.like]: '%' + search + '%'
                        }
                    }]
                }
            })
            const totalPage = Math.ceil(totalRows / limit)
            const result = await user.findAll({
                attributes: ['uuid', 'nama', 'gender', 'tindakan', 'image', 'url'],
                where: {
                    userId: req.userId,
                    [Op.or]: [{
                        nama: {
                            [Op.like]: '%' + search + '%'
                        }
                    }, {
                        tindakan: {
                            [Op.like]: '%' + search + '%'
                        }
                    }],
                },
                include: [{
                    model: Login,
                    attributes: ['name', 'email', 'role']
                }],
                offset: offset,
                limit: limit,
                order: [
                    ['id', 'DESC']
                ]
            })
            res.json({
                result: result,
                page: page,
                limit: limit,
                totalRows: totalRows,
                totalPage: totalPage
            })
        }
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

export const getUserById = async (req, res) => {

    try {
        const User = await user.findOne({
            where: {
                uuid: req.params.id
            }
        });
        if (!User) return res.status(404).json({ msg: "Data tidak ditemukan" });
        let response;
        if (req.role === "admin") {
            response = await user.findOne({
                attributes: ['uuid', 'nama', 'gender', 'tindakan', 'image', 'url'],
                where: {
                    id: User.id
                },
                include: [{
                    model: Login,
                    attributes: ['name', 'email']
                }]
            });
        } else {
            response = await user.findOne({
                attributes: ['uuid', 'nama', 'gender', 'tindakan', 'image', 'url'],
                where: {
                    [Op.and]: [{ id: User.id }, { userId: req.userId }]
                },
                include: [{
                    model: Login,
                    attributes: ['name', 'email']
                }]
            });
        }
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

export const createUser = async (req, res) => {
    if (req.files === null) return res.status(400).json({ msg: "No File Uploaded" })
    const nama = req.body.nama
    const gender = req.body.gender
    const tindakan = req.body.tindakan
    const file = req.files.file
    const fileSize = file.data.length
    const ext = path.extname(file.name)
    const fileName = file.md5 + ext
    const url = `${req.protocol}://${req.get("host")}/images/${fileName}`
    const allowedType = ['.png', '.jpg', '.jpeg']

    if (!allowedType.includes(ext.toLowerCase())) return res.status(422).json({ msg: "Invalid Image" })

    if (fileSize > 5000000) return res.status(422).json({ msg: "Image must be less than 5 MB" })

    file.mv(`./public/images/${fileName}`, async (err) => {
        if (err) return res.status(500).json({ msg: err.message })
        try {
            await user.create({
                nama: nama,
                gender: gender,
                tindakan: tindakan,
                image: fileName,
                url: url,
                userId: req.userId
            })
            res.status(201).json({
                msg: "Data berhasil di tambahkan"
            })
        } catch (error) {
            console.log(error.message);
        }
    })
}

export const updateUser = async (req, res) => {
    const User = await user.findOne({
        where: {
            uuid: req.params.id
        }
    })

    if (!User) return res.status(404).json({ msg: "No Data Found" })
    let fileName = ""
    if (req.files === null) {
        fileName = User.image
    } else {
        const file = req.files.file
        const fileSize = file.data.length
        const ext = path.extname(file.name)
        fileName = file.md5 + ext
        const allowedType = ['.png', '.jpg', '.jpeg']

        if (!allowedType.includes(ext.toLowerCase())) return res.status(422).json({ msg: "Invalid Image" })

        if (fileSize > 5000000) return res.status(422).json({ msg: "Image must be less than 5 MB" })

        const filepath = `./public/images/${User.image}`
        fs.unlinkSync(filepath)

        file.mv(`./public/images/${fileName}`, (err) => {
            if (err) return res.status(500).json({ msg: err.message })

        })
    }

    const nama = req.body.nama
    const gender = req.body.gender
    const tindakan = req.body.tindakan
    const url = `${req.protocol}://${req.get("host")}/images/${fileName}`

    try {
        if (req.role === "admin") {
            await user.update({
                nama: nama,
                gender: gender,
                tindakan: tindakan,
                image: fileName,
                url: url
            },
                {
                    where: {
                        id: User.id
                    }
                })

        } else {
            if (req.userId !== User.userId) return res.status(403).json({ msg: "Akses terlarang" });
            await user.update({
                nama: nama,
                gender: gender,
                tindakan: tindakan,
                image: fileName,
                url: url
            },
                {
                    where: {
                        [Op.and]: [{ id: User.id }, { userId: req.userId }]
                    }
                });
        }
        res.status(200).json({ msg: "Data Berhasil Di Perbarui" })
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

export const deleteUser = async (req, res) => {
    const User = await user.findOne({
        where: {
            uuid: req.params.id
        }
    })

    if (!User) return res.status(404).json({ msg: "No Data Found" })
    try {
        const filepath = `./public/images/${User.image}`
        fs.unlinkSync(filepath)
        if (req.role === "admin") {
            await user.destroy({
                where: {
                    id: User.id
                }
            })
        } else {
            if (req.userId !== User.userId) return res.status(403).json({ msg: "Akses terlarang" });
            await user.destroy(
                {
                    where: {
                        [Op.and]: [{ id: User.id }, { userId: req.userId }]
                    }
                });
        }
        res.status(200).json({ msg: "Data Berhasil Di Hapus" })
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}