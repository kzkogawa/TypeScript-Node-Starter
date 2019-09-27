"use strict";

import graph from "fbgraph";
import { Response, Request, NextFunction } from "express";
import { User } from "../models/sequelize/User";
import { AuthToken } from "../models/sequelize/AuthToken";

/**
 * GET /api
 * List of API examples.
 */
export const getApi = (req: Request, res: Response) => {
    res.render("api/index", {
        title: "API Examples"
    });
};

/**
 * GET /api/facebook
 * Facebook API example.
 */
export const getFacebook = (req: Request, res: Response, next: NextFunction) => {
    const rUser = req.user as User;
    AuthToken.findOne({
        where: {
            userId: rUser.id,
            kind: "facebook"
        }
    }).then(token => {
        graph.setAccessToken(token.tokenValue);
        graph.get(`${rUser.facebook}?fields=id,name,email,first_name,last_name,gender,link,locale,timezone`, (err: Error, results: graph.FacebookUser) => {
            if (err) { return next(err); }
            res.render("api/facebook", {
                title: "Facebook API",
                profile: results
            });
        });
    }).error(err => next(err));
};
