import bcrypt from "bcrypt-nodejs";
import crypto from "crypto";

import { Model } from "sequelize";
import { AuthToken } from "./AuthToken";
import { Profile } from "./Profile";

export class User extends Model {
    public id: string;
    public email: string;
    public password: string;
    public passwordResetToken: string;
    public passwordResetExpires: Date;

    public facebook: string;
    public tokens: AuthToken[];

    public profile: Profile;
    public static hashPassword(password: string) {
        return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
    }
    public comparePassword(candidatePassword: string) {
        return bcrypt.compareSync(candidatePassword, this.password);
    }
    public gravatar(size: number = 200) {
        if (!this.email) {
            return `https://gravatar.com/avatar/?s=${size}&d=retro`;
        }
        const md5 = crypto.createHash("md5").update(this.email).digest("hex");
        return `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`;
    }
}

