"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("./routes/auth"));
const protected_1 = __importDefault(require("./routes/protected"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/api/auth', auth_1.default);
app.use('/api', protected_1.default);
app.get('/', (req, res) => {
    res.send('API is running...');
});
const port = parseInt(process.env.PORT || '3000');
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
//# sourceMappingURL=index.js.map