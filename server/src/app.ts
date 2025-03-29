require("./config/");
require("dotenv").config();
import express, { Application, Request, Response, NextFunction } from "express";
import passport from "passport";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth";
import projectsRouter from "./routes/projects";
import usersProjectsRouter from "./routes/users_projects";
import tasksRouter from "./routes/tasks";
import usersTasksRouter from "./routes/users_tasks";
import meetingsRouter from "./routes/meetings";
import usersMeetingsRouter from "./routes/users_meetings";
import messagesRouter from "./routes/messages";
import usersRouter from "./routes/users";
import bbbRouter from './routes/bbb'
import { getLoc, getPersonByGitHub, saveLoc } from "./models/person";
import { socketServer } from "./socketServer";
import resourcesRoutes from "./routes/resources";
import { verifyToken } from "./middleware/auth";
const cors = require("cors");
const app: Application = express();
const port = process.env.PORT || 5002;

app.set('trust proxy', 1);

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Set-Cookie']
}));
app.use(express.json());
app.use(cookieParser());

// Initialize passport
app.use(passport.initialize());

// Routes that don't require authentication
app.use("/auth", authRouter);

// Protected routes
app.use("/projects", verifyToken, projectsRouter);
app.use("/users_projects", verifyToken, usersProjectsRouter);
app.use("/tasks", verifyToken, tasksRouter);
app.use("/users_tasks", verifyToken, usersTasksRouter);
app.use("/meetings", verifyToken, meetingsRouter);
app.use("/users_meetings", verifyToken, usersMeetingsRouter);
app.use("/messages", verifyToken, messagesRouter);
app.use("/users", verifyToken, usersRouter);
app.use('/bbb', verifyToken, bbbRouter);
app.use("/resources", verifyToken, resourcesRoutes);

app.get("/user", verifyToken, (req: Request, res: Response) => {
  const reqUser = req.user as any;
  console.log("User from token:", reqUser);

  // If user has oauth_id, they logged in with GitHub
  if (reqUser.oauth_id) {
    getPersonByGitHub(reqUser.oauth_id).then((data) => {
      console.log("GitHub user authenticated");
      res.status(200).send(data.rows[0]);
    });
  } else {
    // Local authentication user - send the user data directly
    console.log("Local user authenticated");
    res.status(200).send(reqUser);
  }
});

app.post("/loc", verifyToken, (req: Request, res: Response) => {
  const reqUser = req.user as any;
  const loc: string = req.body.loc;
  saveLoc(reqUser.oauth_id, loc).then((data) => {
    res.status(200).send("saved");
  });
});

interface LocData {
  user: UserLoc;
  others: OtherLoc[];
}

interface OtherLoc {
  lat: number;
  lng: number;
}
interface UserLoc extends OtherLoc {
  name: string;
}

app.get("/loc", verifyToken, (req: Request, res: Response) => {
  const reqUser = req.user as any;
  const githubId = reqUser.oauth_id;
  getLoc().then((data) => {
    const result: LocData = {
      user: {
        lat: 0,
        lng: 0,
        name: "",
      },
      others: [],
    };
    for (let userLocObj of data.rows) {
      if (!userLocObj.lat || !userLocObj.lng) {
        continue;
      }
      if (userLocObj.oauth_id === githubId) {
        result.user.lat = userLocObj.lat;
        result.user.lng = userLocObj.lng;
        result.user.name = userLocObj.name;
      } else {
        result.others.push({ lat: userLocObj.lat, lng: userLocObj.lng });
      }
    }
    res.status(200).send(result);
  });
});

// Start both HTTP and Socket.IO servers
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Initialize Socket.IO server
socketServer.listen(5080, () => {
  console.log('Socket.IO server is running on port 5080');
});
