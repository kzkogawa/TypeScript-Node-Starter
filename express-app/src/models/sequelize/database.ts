import { Sequelize, DataTypes } from "sequelize";

import { DB_URI } from "../../util/secrets";
import { AuthToken } from "./AuthToken";
import { User } from "./User";
import { Profile } from "./Profile";


const database = new Sequelize(DB_URI);

// https://sequelize.org/master/manual/typescript.html

User.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    email: {
        type: DataTypes.STRING
    },
    password: {
        type: DataTypes.STRING
    },
    passwordResetToken: {
        type: DataTypes.STRING
    },
    passwordResetExpires: {
        type: DataTypes.DATE
    },
    facebook: {
        type: DataTypes.STRING
    },
}, { sequelize: database, tableName: "user", });

AuthToken.init({
    userId: {
        type: DataTypes.UUID,
    },
    tokenValue: {
        type: DataTypes.STRING
    },
    kind: {
        type: DataTypes.STRING(10)
    },
}, { sequelize: database, tableName: "authtoken", });

Profile.init({
    userId: {
        type: DataTypes.UUID,
    },
    name: {
        type: DataTypes.STRING
    },
    gender: {
        type: DataTypes.STRING
    },
    location: {
        type: DataTypes.STRING
    },
    website: {
        type: DataTypes.STRING
    },
    picture: {
        type: DataTypes.STRING
    },
}, { sequelize: database, tableName: "profile", });

//
//relation
User.hasMany(AuthToken, {
    sourceKey: "id",
    foreignKey: "userId"
});
User.hasOne(Profile, {
    sourceKey: "id",
    foreignKey: "userId",
    as: "profile"//for 'include: [User.associations.profile]'
});

export default database;