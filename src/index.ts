// import { AppDataSource } from "./data-source"
// import { User } from "./entity/User"

// AppDataSource.initialize().then(async () => {

//     console.log("Inserting a new user into the database...")
//     const user = new User()
//     user.firstName = "Timber"
//     user.lastName = "Saw"
//     user.age = 25
//     await AppDataSource.manager.save(user)
//     console.log("Saved a new user with id: " + user.id)

//     console.log("Loading users from the database...")
//     const users = await AppDataSource.manager.find(User)
//     console.log("Loaded users: ", users)

//     console.log("Here you can setup and run express / fastify / any other framework.")

// }).catch(error => console.log(error))

import express, { Express, Request, Response } from 'express';
import cors from 'cors';

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(cors());

app.get('/health', (req: Request, res: Response) => {
  res.send('Server Running!');
});

app.get('/schedule', (req: Request, res: Response) => {
  res.send('Server Running!');
});

app.post('/schedule', (req: Request, res: Response) => {
  res.send('Server Running!');
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
