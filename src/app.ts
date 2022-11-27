import express, { Express, Request, Response } from 'express'
import cors from 'cors'; 

const app: Express = express()
const port = process.env.PORT || 3000;

app.use(cors());

app.get('/health', (req: Request, res: Response) => {
  res.send('Server Running!')
})

app.get('/schedule', (req: Request, res: Response) => {
  res.send('Server Running!')
})

app.post('/schedule', (req: Request, res: Response) => {
  res.send('Server Running!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})