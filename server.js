const express = require('express');
const app = express();
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { my_auth, get_school, my_reg,saveFilePathToDB, get_courses, get_courses_access } = require('./dbFunctions');

// Middleware for parsing JSON request bodies
app.use(express.json());
app.use(cors());

// Настройка хранилища для multer
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Маршрут для загрузки файла
app.post('/upload', upload.single('file'), async (req, res) => {
    const { schoolName } = 1; // Предполагается, что название школы приходит в теле запроса
    const filePath = req.file.path;

    try {
        const result = await saveFilePathToDB(schoolName, filePath);
        res.json({ message: 'File uploaded and path saved successfully', result: result });
    } catch (error) {
        res.status(500).json({ message: 'Error saving file path to the database' });
    }
});

app.get('/',(req,res)=>{
    res.send('Working well')
})
app.post('/login', async (req, res) => {
    const uname = req.body.uname;
    const password = req.body.password;
    try {
        const users = await my_auth(uname, password, req.body.school);
        if (users.length > 0) {
            res.json({ message: 'Authentication successful', users: users });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error connecting to the database' });
    }
});

app.get('/school', async (req, res) => {
    const id = parseInt(req.query.id);
    try {
        const school = await get_school(id);
        if (school.length > 0) {
            res.json({ school: school });
        } else {
            res.status(404).json({ message: 'School not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error connecting to the database' });
    }
});

app.post('/register', async (req, res) => {
    const uname = req.body.uname;
    const password = req.body.password;
    const school = req.body.school
    try {
        const result = await my_reg(uname, password,school);
        res.json({ message: 'User registered successfully', result: result });
    } catch (error) {
        res.status(500).json({ message: 'Error connecting to the database' });
    }
});
//Courses
app.post('/courses', async (req, res) => {
    try {
        const courses = await get_courses();
        if (courses.length > 0) {
            res.json({ courses: courses });
        } else {
            res.status(404).json({ message: 'Courses not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error connecting to the database' });
    }
});
app.post('/courses-access', async (req, res) => {
    try {
        const access=[[1,1]]
        const courses = await get_courses_access(access);
        if (courses.length > 0) {
            res.json({ courses: courses });
        } else {
            res.status(404).json({ message: 'Courses not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error connecting to the database' });
    }
});
app.listen(3001, () => {
    console.log('Server is running on port 3001');
});
