import { Model } from "sequelize";

export class Profile extends Model {
    public userId: string;
    public name: string;
    public gender: string;
    public location: string;
    public website: string;
    public picture: string;
}

