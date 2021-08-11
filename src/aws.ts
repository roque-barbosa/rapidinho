import 'dotenv/config'
import aws from 'aws-sdk'

aws.config.update({
    secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY,
    accessKeyId:process.env.AWS_ACCESS_KEY_ID,
    region:process.env.AWS_REGION
});

const s3 = new aws.S3();

export default s3