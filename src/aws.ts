import 'dotenv/config'
import aws from 'aws-sdk'

aws.config.update({
    secretAccessKey:'sTkDvCnHbnaHlx2nw9vLHSj0ZAmLhjxwKBKRK2Ue',
    accessKeyId:'AKIAUXUKQPZO4GH45HJS',
    region:'us-east-2'
});

const s3 = new aws.S3();

export default s3