// dbFunctions.js
const { MongoClient } = require('mongodb');
const crypto = require('crypto');

const uri = 'mongodb://localhost:27017';
const dbName = 'study';
const collectionName = 'users';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Function to hash passwords using MD5
function hashPassword(password) {
    return crypto.createHash('md5').update(password).digest('hex');
}

async function my_auth(uname, pass, school) {
    try {
        await client.connect();
        const db = client.db(dbName);
        const coll = db.collection(collectionName);
        const hashedPass = hashPassword(pass);
        const users = await coll.find({ name: uname, password: hashedPass, schoolId: school }).toArray();
        return users;
    } catch (error) {
        console.log('Error connecting to the database');
        throw error;
    }
}
async function get_courses() {
    try {
        await client.connect();
        const db = client.db(dbName);
        const coll = db.collection('courses');
        const courses = await coll.find({ paragraph:1 }).toArray();
        return courses;
    } catch (error) {
        console.log('Error connecting to the database');
        throw error;
    }
}
async function get_courses_access(userAccess) {
    try {
        await client.connect();
        const db = client.db(dbName);
        const coll = db.collection('courses');

        // Запрашиваем все курсы
        const allCourses = await coll.find().toArray();

        // Преобразуем массив доступов в Set для быстрого поиска
        const accessSet = new Set(userAccess.map(access => `${access[0]}_${access[1]}`));

        // Разделяем курсы на доступные и недоступные для пользователя
        const courses = allCourses.map(course => {
            const accessKey = `${course.paragraph}_${course.lesson}`;
            if (accessSet.has(accessKey)) {
                // Курс доступен пользователю
                return course;
            } else {
                // Курс недоступен, возвращаем только необходимые поля
                return {
                    id: course._id,
                    paragraph: course.paragraph,
                    lesson: course.lesson,
                    title: course.title,
                    access: 0
                };
            }
        });

        return courses;
    } catch (error) {
        console.log('Error connecting to the database');
        throw error;
    }
}


async function get_school(id) {
    try {
        await client.connect();
        const db = client.db(dbName);
        const coll = db.collection('schools');
        const school = await coll.find({ schoolId: id }).toArray();
        return school;
    } catch (error) {
        console.log('Error connecting to the database');
        throw error;
    }
}

async function my_reg(uname,  pass,school) {
    try {
        await client.connect();
        const db = client.db(dbName);
        const coll = db.collection(collectionName);
        const hashedPass = hashPassword(pass);
        const result = await coll.insertOne({ name: uname, password: hashedPass,schoolId:school });
        return result;
    } catch (error) {
        console.log('Error connecting to the database');
        throw error;
    }
}

async function saveFilePathToDB(schoolName, filePath) {
    try {
        await client.connect();
        const db = client.db(dbName);
        const coll = db.collection('schools');
        const result = await coll.insertOne({ schoolName: schoolName, filePath: filePath });
        return result;
    } catch (error) {
        console.log('Error connecting to the database');
        throw error;
    }
}
module.exports = {
    my_auth,
    get_school,
    my_reg,
    saveFilePathToDB,
    get_courses,
    get_courses_access
};
