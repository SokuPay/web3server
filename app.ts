import createHttpError from "http-errors";
import express from "express";
import { Request, Response, NextFunction } from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger, { token } from "morgan";
import cors from 'cors';

import { router as createPaymentRouter } from "./app/contollers/createPayment";
import { router as updatePaymentSolStatusRouter } from "./app/contollers/updatePaymentSolStatus";
import { router as mintNftRouter } from "./app/contollers/mintNft";

const app = express();

// -------------------------------------------
//  App Config
// -------------------------------------------
app.set("views", path.join(__dirname, "/app/views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(cors()); // CORS-enabled for all origins
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// -------------------------------------------
//  Routing
// -------------------------------------------
app.use("/create_payment", createPaymentRouter);
app.use("/update_payment_sol_status", updatePaymentSolStatusRouter);
app.use("/mint_nft", mintNftRouter);

// -------------------------------------------
//  Server Config
// -------------------------------------------
app.use((req: Request, res: Response, next: NextFunction) =>
  next(createHttpError(404))
);
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.render("error");
});

const port = process.env.PORT || 3010;
app.listen(port, () => {
  console.log(`listening on port:${port}`);
});

module.exports = app;