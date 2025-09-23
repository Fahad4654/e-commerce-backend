"use strict";
// src/routes/protected.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.get('/profile', authMiddleware_1.authMiddleware, (req, res) => {
    res.json({ user: req.user });
});
exports.default = router;
//# sourceMappingURL=protected.js.map