import { Model } from "sequelize";

export class AuthToken extends Model {
    public userId: string;
    public tokenValue: string;
    public kind: string;
}

