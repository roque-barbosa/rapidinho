import "reflect-metadata";
import "dotenv/config";
import express from "express";
import cors from "cors";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { createConnection } from "typeorm";
import Redis from "ioredis";
import session from "express-session";
import connectRedis from "connect-redis";
import { COOKIE_NAME } from "./constants";
import { ClientResolver } from "./resolvers/ClientResolver";
import { HelloResolver } from "./resolvers/HelloResolver";
import { graphqlUploadExpress } from "graphql-upload";
import { TaxiResolver } from "./resolvers/TaxiResolver";
import { RunsResolver } from "./resolvers/RunsResolver";
import { VeicleResolver } from "./resolvers/VeiclesResponse";
import { UserResolver } from "./resolvers/UserResolver";
import { PaymentResolver } from "./resolvers/PaymentResolver";
import { AvaliationClientResolver } from "./resolvers/AvaliationClientResolver";
import { AvaliationTaxiResolver } from "./resolvers/AvaliationTaxiResolver";
import IORedis from "ioredis";

async function main() {
  let redis: IORedis.Redis, RedisStore: any;

  if (process.env.NODE_ENV === "dev") {
    await createConnection();

    RedisStore = connectRedis(session);
    redis = new Redis();
  } else {
    await createConnection({
      type: "mysql",
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT!),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      synchronize: true,
      logging: false,
      entities: ["dist/entity/**/*.js"],
      migrations: ["dist/migration/**/*.js"],
      subscribers: ["dist/subscriber/**/*.js"],
      cli: {
        entitiesDir: "src/entity",
        migrationsDir: "src/migration",
        subscribersDir: "src/subscriber",
      },
    }); // Create DB connection

    RedisStore = connectRedis(session); // Connext to redis using express session
    redis = new Redis({
      port: parseInt(process.env.REDIS_PORT!),
      host: process.env.REDIS_HOST,
      family: 4,
      password: process.env.REDIS_PASSWORD,
      username: process.env.REDIS_USER,
      db: 0,
      reconnectOnError: (err) => {
        const targetError = "READONLY";
        if (err.message.includes(targetError)) {
          // Only reconnect when the error contains "READONLY"
          return true; // or `return 1;`
        } else {
          return false;
        }
      },
    }); //TROCAR ESSA COISA PELA URL DO REDIS

    redis.on("error", () => {});
  }

  const app = express(); // Initialize express

  app.use(
    cors({
      origin: "*",
      credentials: true,
    })
  );

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redis,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365, // 10 fucking years
        httpOnly: true,
        sameSite: "lax", // csrf
        secure: false,
      },
      secret: "cjhgknlicjli",
      resave: false,
      saveUninitialized: false,
    })
  );

  app.use(graphqlUploadExpress({ maxFileSize: 1000000000, maxFiles: 10 }));

  // Apply apollo middleware
  const apolloServer = new ApolloServer({
    // uploads: false,
    schema: await buildSchema({
      resolvers: [
        ClientResolver,
        HelloResolver,
        TaxiResolver,
        RunsResolver,
        VeicleResolver,
        UserResolver,
        PaymentResolver,
        AvaliationClientResolver,
        AvaliationTaxiResolver,
      ],
      validate: false,
    }),
    context: ({ req, res }) => ({
      req,
      res,
      redis,
    }),
  });

  apolloServer.applyMiddleware({
    app,
    cors: false,
  });

  //app.use(cors)

  app.get("/", async (_, res) => {
    res.send("Hi");
  });

  app.listen(process.env.API_PORT || 3333, () => {
    console.log("server started");
  });
}
main();
