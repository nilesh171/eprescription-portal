# Secure E-Prescription Management Portal

A secure cloud-based web portal that allows doctors to generate digital prescriptions, patients to access them, and pharmacies to verify them. Built using the React, Node.js, Express, MySQL, styled with Tailwind CSS, and designed for AWS Free Tier cloud deployment.

## System Architecture

The system follows a classic three-tier architecture:
- **Client (Frontend)**: React.js SPA (Vite), styled with TailwindCSS, using Axios for API calls.
- **Server (Backend)**: Node.js/Express.js REST API, secured with JWT and bcrypt.
- **Database & Storage**: MySQL database (AWS RDS) and AWS S3 for secure PDF file storage.

```
[User Browser] <--> [React Frontend App] <--> [Node.js Backend on EC2]
                                                      |
                                           -----------------------
                                           |                     |
                                [AWS RDS (MySQL)]      [AWS S3 (Private Bucket)]
```

## Features

- **Doctor Portal**: Create accounts, manage patients, generate prescriptions with medicines, generate QR codes, upload prescription PDFs.
- **Patient Portal**: View medical history, view diagnosis and medicines, securely download prescription files via time-limited S3 pre-signed URLs.
- **Pharmacy Portal**: Verify prescriptions by searching ID or scanning QR codes, mark prescriptions as dispensed to prevent reuse.
- **Security**: JWT-based authentication, password hashing, role-based access control, file storage encryption, and secure pre-signed download URLs.

---

## Local Development Setup

### Prerequisites
- Node.js (v18+)
- MySQL Server
- AWS Account (for S3 storage)

### 1. Database Setup
1. Create a MySQL database named `eprescription_db`.
2. Run the SQL commands in `backend/schema.sql` to generate the required tables.

### 2. AWS S3 Setup
1. Log into your AWS Console.
2. Go to **S3** and create a new bucket.
3. Uncheck "Block all public access" if you intend to use public ACLs, or keep it blocked and use the Pre-Signed URL logic provided in the backend. (The backend is configured for private access by default).
4. Create an IAM User with `AmazonS3FullAccess` and generate an Access Key and Secret Key.

### 3. Backend Setup
1. Navigate to the `backend` directory: `cd backend`
2. Install dependencies: `npm install`
3. Create a `.env` file in the `backend` directory based on the following template:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=eprescription_db
JWT_SECRET=your_super_secret_jwt_key
AWS_ACCESS_KEY=your_aws_access_key
AWS_SECRET_KEY=your_aws_secret_key
AWS_BUCKET_NAME=your_bucket_name
AWS_REGION=us-east-1
```
4. Start the server: `node server.js`

### 4. Frontend Setup
1. Navigate to the `frontend` directory: `cd frontend`
2. Install dependencies: `npm install`
3. The API base URL is configured in `src/services/api.js`. It defaults to `http://localhost:5000/api`.
4. Start the development server: `npm run dev`

---

## AWS Deployment Instructions (Free Tier)

### 1. Setup AWS RDS (MySQL Database)
1. Go to **RDS** in AWS Console.
2. Click **Create Database**.
3. Choose **MySQL** and select the **Free Tier** template.
4. Set the DB instance identifier, username, and password. Keep note of these.
5. Under Connectivity, set **Public access** to "Yes" (for testing) or keep it "No" and connect via your EC2 instance. Ensure the VPC Security Group allows inbound traffic on port `3306`.
6. Once created, copy the **Endpoint** URL. Update your backend `.env` file with this `DB_HOST`.

### 2. Setup AWS EC2 (Backend Hosting)
1. Go to **EC2** and click **Launch Instance**.
2. Choose **Ubuntu Server 22.04 LTS** (Free Tier eligible) and instance type **t2.micro**.
3. Create a new Key Pair and download the `.pem` file.
4. Under Network Settings, allow **SSH (22)**, **HTTP (80)**, and **HTTPS (443)** traffic from anywhere.
5. Launch the instance.
6. Connect via SSH:
   ```bash
   ssh -i "your-key.pem" ubuntu@<your-ec2-public-ip>
   ```
7. Install Node.js on EC2:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```
8. Transfer your backend code to the EC2 instance (using GitHub or `scp`).
9. Run `npm install` inside the `backend` folder on EC2.
10. Set up the `.env` file with production database and S3 credentials.
11. Run the server using a process manager like PM2:
    ```bash
    sudo npm install -g pm2
    pm2 start server.js --name "eprescription-api"
    ```

### 3. Deploy Frontend
You can build the frontend and serve it from the Node.js backend, or use an AWS S3 bucket configured for Static Website Hosting.

To deploy via S3 Static Hosting:
1. Run `npm run build` in your `frontend` directory.
2. Create a new S3 bucket in AWS and enable "Static website hosting".
3. Upload the contents of the `frontend/dist` folder to the bucket.
4. Update the bucket policy to allow public read access (for the frontend files only).
*(Don't forget to update the `baseURL` in `frontend/src/services/api.js` to point to your EC2 instance's IP address before building).*

---

## API Endpoints Documentation

### Authentication
- `POST /api/auth/register` - Register a new user (Doctor, Patient, Pharmacy)
- `POST /api/auth/login` - Authenticate and receive JWT token

### Doctor
- `GET /api/doctor/patients` - List all registered patients
- `GET /api/doctor/prescriptions` - List all prescriptions written by the doctor
- `POST /api/doctor/create-prescription` - Generate a new prescription (JSON + File Upload via form-data)

### Patient
- `GET /api/patient/prescriptions` - Get all prescriptions assigned to the patient
- `GET /api/patient/download/:id` - Get a time-limited AWS S3 Pre-Signed URL for downloading the prescription PDF

### Pharmacy
- `GET /api/pharmacy/verify/:prescriptionId` - Verify a prescription's validity and get details
- `POST /api/pharmacy/dispense` - Mark a prescription as dispensed to prevent reuse
