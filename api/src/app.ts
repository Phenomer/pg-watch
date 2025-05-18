import express from 'express';
import { UserController } from './controllers/userController.js';

const app = express();
const port = Number(process.env.PORT) || 3000;
const bind = process.env.BIND || '0.0.0.0';

const userController = new UserController();

app.use(express.json());

app.get('/api/user_description.json', (_req, res) => {
    userController.getUserDescription(res);
});

app.listen(port, bind, () => {
    console.log(`Server is running on http://${bind}:${port}`);
});
