# Fovus_task_XIFAN
A full-stack serverless file upload application built with React, AWS Lambda, API Gateway, and Amazon S3 Presigned URLs.

This project demonstrates a scalable cloud-native upload workflow where the frontend uploads files directly to S3 without routing file data through the backend server.

##Architecture



React Frontend
        ↓
API Gateway
        ↓
AWS Lambda
(generate presigned URL, because we wanna use URL to connect backend)
example : https://fiona-file-upload.s3.us-east-1.amazonaws.com
        ↓
Browser uploads directly to S3
        ↓
Amazon S3 Bucket

 ##How to Use

Step 1 — Start React Frontend
```
          npm install
          npm start
          http://localhost:3000
```

step 2 After opening ,Select a File and uploadb it

 

 ## Project Workflow
1. User Selects a File

The React frontend allows users to select a local file.

2. Frontend Requests Presigned URL

Frontend sends a request to API Gateway:

3. Lambda Generates Presigned URL using getSignedUrl()
   
5. Browser Uploads Directly to S3
   Frontend uploads the file directly to Amazon S3 using:



## some challange

- Q : i can not choose any document(all of them are click forbidden)
  solution : delete accept=".input” but test the type of docuemnt when submitting it
- Q : can not upload document successfully
  A : by checking web brower console, find that we do not set CORS

