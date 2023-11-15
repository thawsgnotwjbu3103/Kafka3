import {DataTypes, Model} from 'sequelize'
import {sequelize} from "../helper/database";

export class Save extends Model {}
Save.init({
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
    }
}, {
    sequelize,
    modelName: "TBL_SAVE"
})