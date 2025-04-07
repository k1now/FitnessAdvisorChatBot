import AWS from "aws-sdk";
import dotenv from "dotenv";

dotenv.config();

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

export async function fetchFromS3() {
  try {
    console.log("📥 Fetching latest health data from S3...");
    
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `${process.env.S3_FOLDER}/health_data.csv`,
    };

    const data = await s3.getObject(params).promise();
    
    if (!data || !data.Body) {
      throw new Error("No data found in S3");
    }

    // Return the raw CSV data
    const csvData = data.Body.toString('utf-8');
    console.log("✅ Successfully retrieved health data");
    return csvData;
  } catch (error) {
    console.error("❌ Error fetching health data:", error.message);
    throw error;
  }
}

export { s3 }; 