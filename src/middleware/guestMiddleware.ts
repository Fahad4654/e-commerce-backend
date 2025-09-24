
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export const guestMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (req.cookies.guestId) {
        // If guestId cookie exists, do nothing
        return next();
    }
    // If guestId cookie does not exist, generate a new guest ID and set it as a cookie
    const guestId = uuidv4();
    res.cookie('guestId', guestId, { maxAge: 900000, httpOnly: true });
    (req as any).guestId = guestId;
    next();
};

