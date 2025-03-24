require('dotenv').config();
import passport from 'passport';
import camelcaseKeys from 'camelcase-keys';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import * as userDb from '../models/person';
import pool from '../db/dbConfig';

// Extend Express User type
declare global {
  namespace Express {
    interface User {
      id: number;
      email: string;
      password: string;
      name: string;
      avatar?: string;
      role: string;
    }
  }
}

// serialize the user.id to save in the cookie session
// so the browser will remember the user when login
passport.serializeUser((user: Express.User, done) => {
  done(null, user.id);
});

// deserialize the cookieUserId to user in the database
passport.deserializeUser(async (id: number, done) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    done(null, result.rows[0]);
  } catch (e) {
    done(new Error('Failed to deserialize an user'));
  }
});

// Local Strategy
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email: string, password: string, done: any) => {
      try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
          console.log('incorrect email')
          return done(null, false, { message: 'Incorrect email.' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          console.log('incorrect password')
          return done(null, false, { message: 'Incorrect password.' });
        }

        return done(null, user);
      } catch (error) {
        console.log(error)
        return done(error);
      }
    }
  )
);

// GitHub Strategy
passport.use(
  //@ts-ignore
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK,
    },
    //@ts-ignore
    async (accessToken, refreshToken, profile, done) => {
      // find current user in UserModel
      console.log('profile :>> ', profile);
      let user = await userDb.getPersonByGitHub(profile.id);
      console.log('user :>> ', user);
      // create new user if the database doesn't have this user
      const name = profile.displayName ? profile.displayName : profile.username;
      if (!user.rows.length) {
        await userDb.createPersonByGitHub(
          profile.id,
          name,
          profile.photos[0].value
        );
        user = await userDb.getPersonByGitHub(profile.id);
      }
      done(null, user.rows[0]);
    }
  )
);
