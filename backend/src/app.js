import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors());

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

//student routes
import studentRouter from "./routes/student.routes.js";
app.use("/api/student", studentRouter);

//teacher routes
import teacherRouter from "./routes/teacher.routes.js";
app.use("/api/teacher", teacherRouter);

//course routes
import courseRouter from "./routes/course.routes.js";
app.use("/api/course", courseRouter);

import adminRouter from "./routes/admin.routes.js";
app.use("/api/admin", adminRouter);

// import paymentRouter from "./routes/payment.routes.js"
// app.use("/api/payment", paymentRouter)

//payment request routes
import paymentRequestRouter from "./routes/paymentRequest.routes.js";
app.use("/api/payment-request", paymentRequestRouter);

export { app };
