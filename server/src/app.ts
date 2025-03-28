require("./config/");
require("dotenv").config();
import express, { Application, Request, Response, NextFunction } from "express";
import passport from "passport";
import cookieSession from "cookie-session";
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

console.log(process.env.DOMAIN)
app.use(cookieParser());
app.use(
  cookieSession({
    name: "session",
    keys: [process.env.COOKIE_KEY!],
    maxAge: 48 * 60 * 60 * 1000, // 48 hours
    secure: true, // Always use secure in production
    sameSite: "none", // Required for cross-origin requests
  })
);

// Initialize passport before session
app.use(passport.initialize());
app.use(passport.session());
// Add session debugging middleware
app.use(express.json());
app.use((req, res, next) => {
  console.log('req.session :>> ', req.session);
  console.log('User:', req.user);
  console.log('Cookies:', req.cookies);
  next();
});

app.use("/auth", authRouter);
app.use("/projects", projectsRouter);
app.use("/users_projects", usersProjectsRouter);
app.use("/tasks", tasksRouter);
app.use("/users_tasks", usersTasksRouter);
app.use("/meetings", meetingsRouter);
app.use("/users_meetings", usersMeetingsRouter);
app.use("/messages", messagesRouter);
app.use("/users", usersRouter);
app.use('/bbb', bbbRouter)
app.use("/resources", resourcesRoutes);

const authCheck = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    res.status(401).json({
      authenticated: false,
      message: "user has not been authenticated",
    });
  } else {
    next();
  }
};

app.get("/", authCheck, (req: Request, res: Response) => {
  res.status(200).json({
    authenticated: true,
    message: "user successfully authenticated",
    user: req.user,
    cookies: req.cookies,
  });
});

app.get("/logout", (req: Request, res: Response) => {
  console.log("logging out")
  req.logOut();
  res.status(200).send("logged out");
  // res.redirect("/login");
});

app.get("/user", authCheck, (req: Request, res: Response) => {
  const reqUser = req.user as any;
  console.log("User from session:", reqUser);

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

app.post("/loc", (req: Request, res: Response) => {
  if (req.isAuthenticated()) {
    const reqUser = req.user as any;
    const loc: string = req.body.loc;
    saveLoc(reqUser.oauth_id, loc).then((data) => {
      res.status(200).send("saved");
    });
    return;
  }
  res.status(401).send("not authenticated");
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

app.get("/loc", (req: Request, res: Response) => {
  if (req.isAuthenticated()) {
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
      // console.log('result :>> ', result);
      res.status(200).send(result);
    });
    return;
  }
  res.status(401).send("not authenticated");
});

// Start both HTTP and Socket.IO servers
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Initialize Socket.IO server
socketServer.listen(5080, () => {
  console.log('Socket.IO server is running on port 5080');
});
