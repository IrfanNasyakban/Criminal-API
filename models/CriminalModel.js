import { Sequelize } from "sequelize";
import db from "../config/database.js";
import Login from "./LoginModel.js"

const {DataTypes} = Sequelize;

const criminal = db.define('criminals',{
    uuid:{
        type: DataTypes.STRING,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        validate:{
            notEmpty: true
        }
    },
    nama: DataTypes.STRING,
    gender: DataTypes.STRING,
    tindakan: DataTypes.STRING,
    image: DataTypes.STRING,
    url: DataTypes.STRING,
    userId:{
        type: DataTypes.INTEGER,
        allowNull: false,
        validate:{
            notEmpty: true
        }
    }
},{
    freezeTableName:true
})

Login.hasMany(criminal);
criminal.belongsTo(Login, {foreignKey: 'userId'})

export default criminal;

(async () => {
    await db.sync()
})()