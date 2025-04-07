import express from 'express';
import cors from 'cors';
import { s3 } from './fetchFromS3.js';
import dotenv from 'dotenv';
import multer from 'multer';

dotenv.config();

const app = express();
const port = 3001;

app.use(cors());

const upload = multer(); // memory storage by default

export async function uploadToS3(csvData) {
  try {
    const key = `${process.env.S3_FOLDER}/health_data.csv`;

    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: csvData,
      ContentType: 'text/csv'
    };

    await s3.upload(params).promise();
    console.log("✅ Successfully uploaded CSV to S3");
    return { success: true, message: "CSV file uploaded successfully" };
  } catch (error) {
    console.error("❌ Error uploading CSV:", error.message);
    throw error;
  }
}

// Endpoint to receive the CSV file via multipart/form-data
app.post('/upload-csv', upload.single('WorkoutsData'), async (req, res) => {
  try {
    const csvData = req.file.buffer.toString('utf-8');
    const result = await uploadToS3(csvData);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Upload server running at http://localhost:${port}`);
});
