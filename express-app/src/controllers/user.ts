import async from "async";
import crypto from "crypto";
import nodemailer from "nodemailer";
import passport from "passport";
import { User } from "../models/sequelize/User";
import { AuthToken } from "../models/sequelize/AuthToken";
import { Request, Response, NextFunction } from "express";
import { IVerifyOptions } from "passport-local";
import { check, sanitize, validationResult } from "express-validator";
import "../config/passport";
import { Op } from "sequelize";

/**
 * GET /login
 * Login page.
 */
export const getLogin = (req: Request, res: Response) => {
    if (req.user) {
        return res.redirect("/");
    }
    res.render("account/login", {
        title: "Login"
    });
};

/**
 * POST /login
 * Sign in using email and password.
 */
export const postLogin = (req: Request, res: Response, next: NextFunction) => {
    check("email", "Email is not valid").isEmail();
    check("password", "Password cannot be blank").isLength({ min: 1 });
    // eslint-disable-next-line @typescript-eslint/camelcase
    sanitize("email").normalizeEmail({ gmail_remove_dots: false });

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        req.flash("errors", errors.array());
        return res.redirect("/login");
    }

    passport.authenticate("local", (err: Error, user: User, info: IVerifyOptions) => {
        if (err) { return next(err); }
        if (!user) {
            req.flash("errors", { msg: info.message });
            return res.redirect("/login");
        }
        req.logIn(user, (err) => {
            if (err) { return next(err); }
            req.flash("success", { msg: "Success! You are logged in." });
            res.redirect(req.session.returnTo || "/");
        });
    })(req, res, next);
};

/**
 * GET /logout
 * Log out.
 */
export const logout = (req: Request, res: Response) => {
    req.logout();
    res.redirect("/");
};

/**
 * GET /signup
 * Signup page.
 */
export const getSignup = (req: Request, res: Response) => {
    if (req.user) {
        return res.redirect("/");
    }
    res.render("account/signup", {
        title: "Create Account"
    });
};

/**
 * POST /signup
 * Create a new local account.
 */
export const postSignup = (req: Request, res: Response, next: NextFunction) => {
    check("email", "Email is not valid").isEmail();
    check("password", "Password must be at least 4 characters long").isLength({ min: 4 });
    check("confirmPassword", "Passwords do not match").equals(req.body.password);
    // eslint-disable-next-line @typescript-eslint/camelcase
    sanitize("email").normalizeEmail({ gmail_remove_dots: false });

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        req.flash("errors", errors.array());
        return res.redirect("/signup");
    }

    User.findOne({
        where: {
            email: req.body.email
        }
    }).then(existingUser => {
        if (existingUser) {
            req.flash("errors", { msg: "Account with that email address already exists." });
            return res.redirect("/signup");
        }
        User.create({
            email: req.body.email,
            password: req.body.password
        }).then(_user => {
            req.logIn(_user, (err) => {
                if (err) {
                    return next(err);
                }
                res.redirect("/");
            });
        }).error(err => next(err));
    }).error(err => next(err));
};

/**
 * GET /account
 * Profile page.
 */
export const getAccount = (req: Request, res: Response) => {
    res.render("account/profile", {
        title: "Account Management"
    });
};

/**
 * POST /account/profile
 * Update profile information.
 */
export const postUpdateProfile = (req: Request, res: Response, next: NextFunction) => {
    check("email", "Please enter a valid email address.").isEmail();
    // eslint-disable-next-line @typescript-eslint/camelcase
    sanitize("email").normalizeEmail({ gmail_remove_dots: false });

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        req.flash("errors", errors.array());
        return res.redirect("/account");
    }
    const rUser = req.user as User;
    User.findByPk(rUser.id).then(user => {
        user.email = req.body.email || "";
        user.profile.name = req.body.name || "";
        user.profile.gender = req.body.gender || "";
        user.profile.location = req.body.location || "";
        user.profile.website = req.body.website || "";
        user.save().then(_user => {
            req.flash("success", { msg: "Profile information has been updated." });
            res.redirect("/account");
        }).error(err => {
            if (err.code === 11000) {
                req.flash("errors", { msg: "The email address you have entered is already associated with an account." });
                return res.redirect("/account");
            }
            next(err);
        });
    }).error(err => next(err));
};

/**
 * POST /account/password
 * Update current password.
 */
export const postUpdatePassword = (req: Request, res: Response, next: NextFunction) => {
    check("password", "Password must be at least 4 characters long").isLength({ min: 4 });
    check("confirmPassword", "Passwords do not match").equals(req.body.password);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        req.flash("errors", errors.array());
        return res.redirect("/account");
    }
    const rUser = req.user as User;
    User.findByPk(rUser.id).then(user => {
        user.update({
            password: req.body.password
        }).then(_user => {
            req.flash("success", { msg: "Password has been changed." });
            res.redirect("/account");
        }).error(err => next(err));
    }).error(err => next(err));
};

/**
 * POST /account/delete
 * Delete user account.
 */
export const postDeleteAccount = (req: Request, res: Response, next: NextFunction) => {
    const rUser = req.user as User;
    User.destroy({
        where: {
            id: rUser.id
        }
    }).then(result => {
        req.logout();
        req.flash("info", { msg: "Your account has been deleted." });
        res.redirect("/");
    }).error(err => next(err));
};

/**
 * GET /account/unlink/:provider
 * Unlink OAuth provider.
 */
export const getOauthUnlink = (req: Request, res: Response, next: NextFunction) => {
    const provider = req.params.provider;
    const rUser = req.user as User;
    AuthToken.destroy({
        where: {
            userId: rUser.id,
            kind: {
                [Op.not]: provider
            }
        }
    }).then(result => {
        req.flash("info", { msg: `${provider} account has been unlinked.` });
        res.redirect("/account");
    }).error(err => next(err));
};

/**
 * GET /reset/:token
 * Reset Password page.
 */
export const getReset = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) {
        return res.redirect("/");
    }
    User.findOne({
        where: {
            passwordResetToken: req.params.token,
            passwordResetExpires: {
                [Op.gt]: Date.now()
            }
        }
    }).then(user => {
        if (!user) {
            req.flash("errors", { msg: "Password reset token is invalid or has expired." });
            return res.redirect("/forgot");
        }
        res.render("account/reset", {
            title: "Password Reset"
        });
    }).error(err => next(err));
};

/**
 * POST /reset/:token
 * Process the reset password request.
 */
export const postReset = (req: Request, res: Response, next: NextFunction) => {
    check("password", "Password must be at least 4 characters long.").isLength({ min: 4 });
    check("confirm", "Passwords must match.").equals(req.body.password);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        req.flash("errors", errors.array());
        return res.redirect("back");
    }

    async.waterfall([
        function resetPassword(done: Function) {
            User.findOne({
                where: {
                    passwordResetToken: req.params.token,
                    passwordResetExpires: {
                        [Op.gt]: Date.now()
                    }
                }
            }).then(user => {
                if (!user) {
                    req.flash("errors", { msg: "Password reset token is invalid or has expired." });
                    return res.redirect("/forgot");
                }
                user.update({
                    password: req.body.password,
                    passwordResetToken: null,
                    passwordResetExpires: null
                }).then(_user => {
                    req.logIn(user, (err) => {
                        done(err, user);
                    });
                }).error(err => next(err));
            }).error(err => next(err));
        },
        function sendResetPasswordEmail(user: User, done: Function) {
            const transporter = nodemailer.createTransport({
                service: "SendGrid",
                auth: {
                    user: process.env.SENDGRID_USER,
                    pass: process.env.SENDGRID_PASSWORD
                }
            });
            const mailOptions = {
                to: user.email,
                from: "express-ts@starter.com",
                subject: "Your password has been changed",
                text: `Hello,\n\nThis is a confirmation that the password for your account ${user.email} has just been changed.\n`
            };
            transporter.sendMail(mailOptions, (err) => {
                req.flash("success", { msg: "Success! Your password has been changed." });
                done(err);
            });
        }
    ], (err) => {
        if (err) { return next(err); }
        res.redirect("/");
    });
};

/**
 * GET /forgot
 * Forgot Password page.
 */
export const getForgot = (req: Request, res: Response) => {
    if (req.isAuthenticated()) {
        return res.redirect("/");
    }
    res.render("account/forgot", {
        title: "Forgot Password"
    });
};

/**
 * POST /forgot
 * Create a random token, then the send user an email with a reset link.
 */
export const postForgot = (req: Request, res: Response, next: NextFunction) => {
    check("email", "Please enter a valid email address.").isEmail();
    // eslint-disable-next-line @typescript-eslint/camelcase
    sanitize("email").normalizeEmail({ gmail_remove_dots: false });

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        req.flash("errors", errors.array());
        return res.redirect("/forgot");
    }

    async.waterfall([
        function createRandomToken(done: Function) {
            crypto.randomBytes(16, (err, buf) => {
                const token = buf.toString("hex");
                done(err, token);
            });
        },
        function setRandomToken(token: AuthToken, done: Function) {
            User.findOne({
                where: {
                    email: req.body.email
                }
            }).then(user => {
                if (!user) {
                    req.flash("errors", { msg: "Account with that email address does not exist." });
                    return res.redirect("/forgot");
                }
                user.update({
                    passwordResetToken: token,
                    passwordResetExpires: Date.now() + 3600000 // 1 hour
                }).then(_user => {
                    done(null, token, _user);
                }).error(err => done(err));
            }).error(err => done(err));
        },
        function sendForgotPasswordEmail(token: AuthToken, user: User, done: Function) {
            const transporter = nodemailer.createTransport({
                service: "SendGrid",
                auth: {
                    user: process.env.SENDGRID_USER,
                    pass: process.env.SENDGRID_PASSWORD
                }
            });
            const mailOptions = {
                to: user.email,
                from: "hackathon@starter.com",
                subject: "Reset your password on Hackathon Starter",
                text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n
          Please click on the following link, or paste this into your browser to complete the process:\n\n
          http://${req.headers.host}/reset/${token}\n\n
          If you did not request this, please ignore this email and your password will remain unchanged.\n`
            };
            transporter.sendMail(mailOptions, (err) => {
                req.flash("info", { msg: `An e-mail has been sent to ${user.email} with further instructions.` });
                done(err);
            });
        }
    ], (err) => {
        if (err) { return next(err); }
        res.redirect("/forgot");
    });
};
