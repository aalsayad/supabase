import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import crypto from 'crypto';

export const s3 = new S3Client({
  region: process.env.AWS_BUCKET_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_PERSONAL_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_PERSONAL_SECRET_ACCESS_KEY!,
  },
});

export const putObjectCommand = (type: string, size: number, checksum: string, authId: string) => {
  //Generate unique image files everytime a file is uploaded
  const generateFilename = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');
  return new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: generateFilename(),
    ContentType: type,
    ContentLength: size,
    ChecksumSHA256: checksum,
    Metadata: {
      authId,
    },
  });
};
