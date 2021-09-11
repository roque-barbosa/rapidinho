import aws from 'aws-sdk'
import { promisify } from 'util';
import * as fs from 'fs';


class AwsManager {

  secretAccessKey: string;
  accessKeyId: string;
  region: string;
  bucketName: string;
  s3: aws.S3;

  constructor(){
    this.secretAccessKey = 'p5930X+yI/5J4MWjQO3csLh+Z7TUoVTAmzVoSnTY';
    this.accessKeyId = 'AKIAZVBV6SLDPPMDDK4C';
    this.region = 'sa-east-1';
    this.bucketName = 'rapidinho';

    this.s3 = new aws.S3({
      secretAccessKey: this.secretAccessKey,
      accessKeyId:this.accessKeyId,
      region:this.region,
    })
  }

  async createBucket(){
    const params = {
      Bucket: this.bucketName,
    }
    let create_bucket = promisify(this.s3.createBucket.bind(this.s3));
    await create_bucket(params).catch(console.log);
    return {
      success:true,
      message:"Bucket created successfully."
  };
  }

  async sendFileToBucket(fileName: string, fileBucketPath: string){
    
    try {
      const readFile = promisify(fs.readFile)
      const data = await readFile(`temp/images/${fileName}`)
      
      await this.s3.putObject({
        Key: fileBucketPath,
        Bucket: this.bucketName,
        Body: data,
        ACL: 'public-read'
      }).promise()

      await fs.unlink(`temp/images/${fileName}`, (err) => console.log(err))
      return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${fileBucketPath}`
    } catch (error) {
      return null
    }
    
  }

  async fetchBuckets(){
    const listBuckets = promisify(this.s3.listBuckets.bind(this.s3));
    let result = await listBuckets().catch(console.log);
    result = result.Buckets.map((result:any) => result.Name);
    return result;
  }

  async fetchFilesFromBucket(prefix: string){
    let listedObjects;
    const listParams = {
      Bucket: this.bucketName,
      Prefix: prefix
    }
    listedObjects = await this.s3.listObjectsV2(listParams).promise();
    let objectKeys: any[] =[]

    if (listedObjects.Contents) {
      listedObjects.Contents.forEach(({ Key }) => {
        objectKeys.push({ Key });
      });
    }

    return objectKeys
  }

  async deleteFileFromBucket(fileBucketPath: string){
    return await this.s3.deleteObject({
      Bucket: this.bucketName,
      Key: fileBucketPath,
    }, (err) => {
      console.log(err)
      return false
    })
  }

  async deleteMultipleFilesFromBucket(keys:any[]){
    try {
      const deleteParams = {
        Bucket: this.bucketName,
        Delete: {
          Objects:keys
        }
      }
  
      await this.s3.deleteObjects(deleteParams).promise();
      return true
    } catch (error) {
      return false
    }
  }


}

export default new AwsManager();