import passport from "passport";
import passportLocal from "passport-local";
import passportFacebook from "passport-facebook";
import _ from "lodash";
import { Request, Response, NextFunction } from "express";

import { User } from "../models/sequelize/User";
import { AuthToken } from "../models/sequelize/AuthToken";
import logger from "../util/logger";

const LocalStrategy = passportLocal.Strategy;
const FacebookStrategy = passportFacebook.Strategy;

passport.serializeUser<any, any>((user, done) => {
    done(null, (user as User).id);
});

passport.deserializeUser((id, done) => {
    User.findByPk(id as string).done(done);
});

/**
 * Sign in using Email and Password.
 */
passport.use(new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
    User.findOne({ where: { email: email.toLowerCase() } }).then(user => {
        if (user && user.comparePassword(password)) {
            return done(null, user);
        }
        logger.info(`${email}, ${password}`);
        return done(null, false, { message: `Email ${email} not found.` });
    }).error(err => done(err));
}));


/**
 * OAuth Strategy Overview
 *
 * - User is already logged in.
 *   - Check if there is an existing account with a provider id.
 *     - If there is, return an error message. (Account merging not supported)
 *     - Else link new OAuth account with currently logged-in user.
 * - User is not logged in.
 *   - Check if it's a returning user.
 *     - If returning user, sign in and we are done.
 *     - Else check if there is an existing account with user's email.
 *       - If there is, return an error message.
 *       - Else create a new account.
 */


/**
 * Sign in with Facebook.
 */
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_ID,
    clientSecret: process.env.FACEBOOK_SECRET,
    callbackURL: "/auth/facebook/callback",
    profileFields: ["name", "email", "link", "locale", "timezone"],
    passReqToCallback: true
}, (req: any, accessToken, refreshToken, profile, done) => {
    User.findOne({ where: { facebook: profile.id } }).then(existingUser => {
        if (req.user) {
            if (existingUser) {
                const err = "There is already a Facebook account that belongs to you. Sign in with that account or delete it, then link it with your current account.";
                req.flash("errors", { msg: err });
                return done(err);
            }

            User.findByPk(req.user.id).then(existingIdUser => {
                existingIdUser.facebook = profile.id;
                // eslint-disable-next-line @typescript-eslint/no-object-literal-type-assertion
                existingIdUser.tokens.push({ userId: existingIdUser.id, kind: "facebook", tokenValue: accessToken, } as AuthToken);
                existingIdUser.profile.name = existingIdUser.profile.name || `${profile.name.givenName} ${profile.name.familyName}`;
                existingIdUser.profile.gender = existingIdUser.profile.gender || profile._json.gender;
                existingIdUser.profile.picture = existingIdUser.profile.picture || `https://graph.facebook.com/${profile.id}/picture?type=large`;
                existingIdUser.save().then(_existingIdUser => {
                    req.flash("info", { msg: "Facebook account has been linked." });
                    done(null, _existingIdUser);
                });
            }).error(err => done(err));;
        } else {
            if (existingUser) {
                return done(null, existingUser);
            }

            User.findOne({ where: { email: profile._json.email } }).then(existingEmailUser => {
                if (existingEmailUser) {
                    const err = "There is already an account using this email address. Sign in to that account and link it with Facebook manually from Account Settings.";
                    req.flash("errors", { msg: err });
                    return done(err);
                }
                const user: any = new User();
                user.email = profile._json.email;
                user.facebook = profile.id;
                user.tokens.push({ kind: "facebook", accessToken });
                user.profile.name = `${profile.name.givenName} ${profile.name.familyName}`;
                user.profile.gender = profile._json.gender;
                user.profile.picture = `https://graph.facebook.com/${profile.id}/picture?type=large`;
                user.profile.location = (profile._json.location) ? profile._json.location.name : "";
                user.save((err: Error) => {
                    done(err, user);
                });
            }).error(err => done(err));
        }
    }).error(err => done(err));
}));

/**
 * Login Required middleware.
 */
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
};

/**
 * Authorization Required middleware.
 */
export const isAuthorized = (req: Request, res: Response, next: NextFunction) => {
    const provider = req.path.split("/").slice(-1)[0];

    const rUser = req.user as User;
    if (_.find(rUser.tokens, { kind: provider })) {
        next();
    } else {
        res.redirect(`/auth/${provider}`);
    }
};
