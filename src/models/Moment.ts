import {DataTypes} from 'sequelize'
import {sequelize} from "../helper/database";

export const Moment = sequelize.define('TBL_SAVE', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        unique: true,
        primaryKey: true,
        allowNull: false
    },
    indicator: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    context: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    guildId: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, {
    indexes: [
        {
            unique: true,
            fields: ["id"]
        },
        {
            name: "guildId_index",
            using: "BTREE",
            fields: ["guildId"]
        },
        {
            name: "indicator_index",
            using: "BTREE",
            fields: ["indicator"]
        },
    ],
    freezeTableName: true
})