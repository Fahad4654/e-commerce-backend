
import { Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AuthRequest } from './authMiddleware';

export const guestMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    let guestId = req.cookies.guestId;

    if (!guestId) {
        guestId = uuidv4();
        res.cookie('guestId', guestId, { maxAge: 900000, httpOnly: true });
    }

    req.guestId = guestId;
    next();
};
