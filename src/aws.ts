import 'dotenv/config'
import aws from 'aws-sdk'

aws.config.update({
    // secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY,
    // accessKeyId:process.env.AWS_ACCESS_KEY_ID,
    // region:process.env.AWS_REGION
    secretAccessKey:'p5930X+yI/5J4MWjQO3csLh+Z7TUoVTAmzVoSnTY',
    accessKeyId:'AKIAZVBV6SLDPPMDDK4C',
    region:'sa-east-1',
});

const s3 = new aws.S3();

export default s3