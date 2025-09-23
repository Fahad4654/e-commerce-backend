"use strict";
// src/routes/auth.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const authController_1 = require("../controllers/authController");
const router = (0, express_1.Router)();
router.post('/signup', (0, express_validator_1.body)('email').isEmail(), (0, express_validator_1.body)('password').isLength({ min: 6 }), authController_1.register);
router.post('/login', (0, express_validator_1.body)('email').isEmail(), authController_1.login);
exports.default = router;
//# sourceMappingURL=auth.js.map