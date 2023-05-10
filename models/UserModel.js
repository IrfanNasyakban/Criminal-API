import { Sequelize } from "sequelize";
import db from "../config/database.js";
import Login from "./LoginModel.js"

const {DataTypes} = Sequelize;

const user = db.define('users',{
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

Login.hasMany(user);
user.belongsTo(Login, {foreignKey: 'userId'})

export default user;
