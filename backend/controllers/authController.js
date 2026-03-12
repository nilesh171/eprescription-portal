const pool = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const uuidv4 = () => crypto.randomUUID();
require('dotenv').config();

exports.register = async (req, res) => {
    const { name, email, password, role, ...otherDetails } = req.body;
    
    try {
        const [existingUsers] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = uuidv4();

        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            await connection.query(
                'INSERT INTO users (user_id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
                [userId, name, email, hashedPassword, role]
            );

            if (role === 'doctor') {
                const doctorId = uuidv4();
                await connection.query(
                    'INSERT INTO doctors (doctor_id, user_id, specialization, license_number, hospital_name) VALUES (?, ?, ?, ?, ?)',
                    [doctorId, userId, otherDetails.specialization, otherDetails.license_number, otherDetails.hospital_name]
                );
            } else if (role === 'patient') {
                const patientId = uuidv4();
                await connection.query(
                    'INSERT INTO patients (patient_id, user_id, age, gender, phone) VALUES (?, ?, ?, ?, ?)',
                    [patientId, userId, otherDetails.age, otherDetails.gender, otherDetails.phone]
                );
            } else if (role === 'pharmacy') {
                const pharmacyId = uuidv4();
                await connection.query(
                    'INSERT INTO pharmacies (pharmacy_id, user_id, license_number, address) VALUES (?, ?, ?, ?)',
                    [pharmacyId, userId, otherDetails.license_number, otherDetails.address]
                );
            }

            await connection.commit();
            res.status(201).json({ message: 'User registered successfully' });
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ message: 'Authentication failed' });
        }

        const user = users[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Authentication failed' });
        }

        let roleId = null;
        if (user.role === 'doctor') {
            const [doctors] = await pool.query('SELECT doctor_id FROM doctors WHERE user_id = ?', [user.user_id]);
            roleId = doctors[0]?.doctor_id;
        } else if (user.role === 'patient') {
            const [patients] = await pool.query('SELECT patient_id FROM patients WHERE user_id = ?', [user.user_id]);
            roleId = patients[0]?.patient_id;
        } else if (user.role === 'pharmacy') {
            const [pharmacies] = await pool.query('SELECT pharmacy_id FROM pharmacies WHERE user_id = ?', [user.user_id]);
            roleId = pharmacies[0]?.pharmacy_id;
        }

        const token = jwt.sign(
            { userId: user.user_id, role: user.role, roleId: roleId, email: user.email, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({ token, role: user.role, name: user.name });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};
