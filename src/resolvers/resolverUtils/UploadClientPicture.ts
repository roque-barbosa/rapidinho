import { promisify } from "util";
import s3 from '../../aws'

export async function createClientBucket(clientName: String, clientCpf: String) {

  //create an object to hold the name of the bucket.
  const params = {
    //Bucket:clientName
    Bucket: `${clientCpf}_${clientName}`
  }

  try {
    //promisify the createBucket() function so that we can use async/await syntax.
    let create_bucket = promisify(s3.createBucket.bind(s3))

    //call the function to create the bucket.
    await create_bucket(params).catch(console.log);

  }catch (error) {
    console.log(error.message)
    return false
  }

  //return if nohing failed.
  return true
}

export async function fetchBuckets(){

  //promisify the listBuckets() so that we can use the async/await syntax.
  const listBuckets = promisify(s3.listBuckets.bind(s3));

  //get the buckets.
  let result = await listBuckets().catch(console.log);

  //loop through the result extracting only the name of each bucket.
  const buckets = result.Buckets.map((result: any) => result.Name);

  //return the bucket names as response to the client.
  return buckets;

}
