const cors = require("cors");
import express from "express";
import routes from "./routes";
const session = require("express-session");
const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("./swagger-output.json");
import setupAssociations from "./models/associations";

import passport from "./config/passportConfig";

const app = express();

// Use the cors middleware
app.use(cors());
// Middleware to parse JSON
app.use(express.json());

app.use("/doc", swaggerUi.serve, swaggerUi.setup(swaggerFile));

// Session middleware
app.use(session({ secret: "secret", resave: false, saveUninitialized: true }));

// Initialize Passport and restore authentication state, if any, from the session.
app.use(passport.initialize());
app.use(passport.session());

// Use routes
app.use("/api", routes);

setupAssociations();

export default app;

