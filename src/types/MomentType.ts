import {Optional} from "sequelize";

export type MomentType = {
    indicator: string;
    context: string;
    guildId: string
} & Optional<any, any>
