const path = require('path')
const http = require('http')
const express = require('express')

const bodyParser = require('body-parser')
const cors = require('cors')


const { connectDB } = require('./app/config/config');
connectDB();
// Khai báo app
const app = express();
const server = http.createServer(app);
// Mở công giao tiếp công khai
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors());
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
// Khái báo đăng ký routes
const { authRoutes, userRoutes,setupRoutes,assistantRoutes,fileRoutes,conversationRoutes,courseRoutes,lessonRoutes,packageRoutes,licenseRoutes,navRoutes,contractRoutes,promptRoutes, payRoutes } = require('./app/routes');
app.use('/api/auth', authRoutes);
app.use("/api", userRoutes);
app.use("/api", setupRoutes);
app.use("/api", assistantRoutes);
app.use("/api", fileRoutes);
app.use("/api", conversationRoutes);
app.use("/api", courseRoutes);
app.use("/api", lessonRoutes);
app.use("/api", packageRoutes);
app.use("/api", licenseRoutes);
app.use("/api", navRoutes);
app.use("/api", contractRoutes);
app.use("/api", promptRoutes);
app.use("/api", payRoutes);



// Khi có một kết nối mới được thiết lập
const PORT = 2053;
server.listen(PORT, () => console.log(`Listen: ${PORT}`));
