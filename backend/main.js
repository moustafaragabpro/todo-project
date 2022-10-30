import express from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(cors());

// ************************** User *******************************

// * Get all users
app.get('/users', async function (req, res) {
    const users = await prisma.user.findMany();

    return res.json({ users: users });
});

// * Register New User
app.post('/users', async function (req, res) {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;

    // * Check if email exists
    const emailExist = await prisma.user.findFirst({ where: { email: email } });
    if (emailExist) return res.json({ error: 'Email already exists' });

    const user = await prisma.user.create({
        data: {
            username: username,
            email: email,
            password: password,
        },
    });

    return res.json({ message: 'user created successfuly', user: user });
});

// * Login User
app.post('/users/login', async function (req, res) {
    const email = req.body.email;
    const password = req.body.password;

    const user = await prisma.user.findFirst({ where: { email: email } });

    if (!user) return res.json({ error: 'Invalid Email' });

    if (user.password !== password) {
        return res.json({ error: 'Invalid Email' });
    }

    return res.json({ message: 'user Loggedin successfuly', user: user });
});

// ************************** TODO *******************************

// * GET All Todos
app.get('/todos', async function (req, res) {
    const tasks = await prisma.task.findMany();

    return res.json({ tasks: tasks });
});

// * GET Completed Todos
app.get('/todos/completed/:userId', async function (req, res) {
    const userId = req.params.userId;

    const tasks = await prisma.task.findMany({
        where: { isCompleted: true, userId: +userId },
    });

    return res.json({ tasks: tasks });
});

// * GET non completed Todos
app.get('/todos/non-completed/:userId', async function (req, res) {
    const userId = req.params.userId;

    const tasks = await prisma.task.findMany({
        where: { isCompleted: false, userId: +userId },
    });

    return res.json({ tasks: tasks });
});

// * GET Todo By Id
app.get('/todos/:userId/:taskId', async function (req, res) {
    const taskId = req.params.taskId;
    const userId = req.params.userId;

    const tasks = await prisma.task.findFirst({
        where: { id: +taskId, userId: +userId },
    });

    return res.json({ task: tasks });
});

// * Create New Todo
app.post('/todos', async function (req, res) {
    const title = req.body.title;
    const description = req.body.description;
    const userId = req.body.userId;

    const task = await prisma.task.create({
        data: {
            title: title,
            description: description,
            userId: +userId,
        },
    });

    return res.json({ message: 'Task created successfuly' });
});

// * Update Todo
app.put('/todos/:id', async function (req, res) {
    const id = req.params.id;

    // * Check if there is task with given id
    const task = await prisma.task.findFirst({ where: { id: +id } });
    if (!task) return res.json({ error: 'Invalid ID' });

    const updatedTask = await prisma.task.update({
        where: { id: +id },
        data: req.body,
    });

    return res.json({
        message: 'Task Updated Successfully',
        updatedTask: updatedTask,
    });
});

// * Delete Todo
app.delete('/todos/:id', async function (req, res) {
    const id = req.params.id;

    // * Check if there is task with given id
    const task = await prisma.task.findFirst({ where: { id: +id } });
    if (!task) return res.json({ error: 'Invalid ID' });

    // * delete task
    await prisma.task.delete({ where: { id: +id } });

    return res.json({ message: 'Task Deleted Successfully' });
});

// * Mark Todo As Done
app.put('/todos/done/:id', async function (req, res) {
    const id = req.params.id;

    // * Check if there is task with given id
    const task = await prisma.task.findFirst({ where: { id: +id } });
    if (!task) return res.json({ error: 'Invalid ID' });

    await prisma.task.update({
        where: { id: +id },
        data: {
            isCompleted: true,
        },
    });

    return res.json({ message: 'Task marked as complete' });
});

app.listen(4000);
