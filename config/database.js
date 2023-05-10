import { Sequelize } from "sequelize";

const db = new Sequelize('db_criminal','root','',{
    host: 'localhost',
    dialect: 'mysql'
})

export default db;