import {extname} from "path";
//import { extname } from "path/posix";
import { promisify } from "util";
import s3 from '../../aws'
import { getBucketUrl } from '../../utils/getBucketUrl'

type objectResponse = {
  key: String,
  url: String
}

export async function createClientBucket(clientCpf: String) {

  //create an object to hold the name of the bucket.
  const params = {
    //Bucket:clientName
    Bucket: `${clientCpf}-bucket`
  }

  try {
    //promisify the createBucket() function so that we can use async/await syntax.
    let create_bucket = promisify(s3.createBucket.bind(s3))

    //call the function to create the bucket.
    await create_bucket(params);

    //return if nohing failed.
    return true

  }catch (error) {
    console.log(error.message)
    return false
  }
}


export async function fetchAllClientsBuckets(){

  //promisify the listBuckets() so that we can use the async/await syntax.
  const listBuckets = promisify(s3.listBuckets.bind(s3));

  //get the buckets.
  let result = await listBuckets().catch(console.log);

  //loop through the result extracting only the name of each bucket.
  const buckets = result.Buckets.map((result: any) => result.Name);

  //return the bucket names as response to the client.
  return buckets;

}

export async function deleteClientBucket(clientCpf: String): Promise<Boolean>{

  try {
    //create an object to hold the name of the bucket.
    const params = {
      //Bucket:clientName
      Bucket: `${clientCpf}-bucket`
    }

    // promisify the deleteBucket() so that we can use the async/await syntax.
    let removeBucket = promisify(s3.deleteBucket.bind(s3));

    // remove the bucket.
    await removeBucket(params).catch(console.log);

    // send back a response to the client.
    return true
    } catch (error) {
      console.log(error.message)
      return false
    }
  

}

export async function uploadProfilePictureToBucket(fileName: any, createReadStream: any, clientCpf: String): Promise<objectResponse | undefined>{

  try {

    // create an object to hold the name of the bucket, key, body, and acl of the object.
    const params = {
      Bucket: `${clientCpf}-bucket`,
      Key: '',
      Body: '',
      ACL:'public-read'
    }

    // set the body of the object as data to read from the file.
    params.Body = await createReadStream()
    

    // get the current time stamp.
    //let timestamp = new Date().getTime();

    // get the file extension.
    console.log(fileName)
    let file_extension = extname(fileName)
    
    

    // set the key as a combination of the folder name, clientCpf, and the file extension of the object.
    params.Key = `profile-picture/${clientCpf}${file_extension}`;

    // promisify the upload() function so that we can use async/await syntax.
    let upload = promisify(s3.upload.bind(s3))

    // upload the object.
    let result = await upload(params)

    // structure the response.
    let object = {
        key:params.Key,
        url:result.Location
    };

    return object

  } catch (error) {
    console.log(error.message)
    return undefined
  }
}

//fetching objects.
export async function fetchProfilePictureToBucket(clientCpf: String){

  const bucketName = `${clientCpf}-bucket`
  // create an object to hold the name of the bucket.
  const params = {
      Bucket:bucketName,
      Prefix: `profile-picture/${clientCpf}`
  };

  // promisify the listObjects() function so that we can use the async/await syntax.
  let getObjects = promisify(s3.listObjects.bind(s3));

  //let test = s3.listObjects({Bucket:'teste',Prefix})

  // get the objects.
  let result = await getObjects(params)

  // come up with the array to be returned.
  let objects: any[] = [];

  // Loop through each object returned, structuring the data to be pushed to the objects array.
  result.Contents.forEach( (content: any) => {
      return objects.push({
          key:content.Key,
          url:getBucketUrl.bind(bucketName,content.Key)
      })
  } );

  // return response to the client.
  return objects;

};

export async function deleteFileFromClientBucket(clientCpf: String, key: String){

  // create an object to hold the name of the bucket, and the key of an object.
  const params = {
      Bucket:`${clientCpf}-bucket`,
      Key: key
  };

  try {
    // promisify the deleteObject() so that we can use the async/await syntax.
    let removeObject = promisify(s3.deleteObject.bind(s3));

    // remove the object.
    await removeObject(params)

    // send back a response to the client.
    return true
  } catch (error) {
    return false
  }

};

export async function deletContentAndBucketFromUser(clientCpf: String): Promise<Boolean>{

  let bucketName = `${clientCpf}-bucket`

  try {

    // create an object to hold the name of the bucket, key, body, and acl of the object.
    let params = {
      Bucket: bucketName,
    }

    // promisify the listObjects() function so that we can use the async/await syntax.
    let getObjects = promisify(s3.listObjects.bind(s3));

    // get the objects.
    let fechResult = await getObjects(params)
    //onsole.log(fechResult.Contents[0].Key)

    // create an object to hold the name of the bucket and the objects to be deleted.
    const deleteParams = {
      Bucket:bucketName,
      Delete:{
          Objects:[]
      }
    };

    // Loop through each object returned, structuring the data to be pushed to the objects array.
    fechResult.Contents.forEach( (content: any) => {
      return deleteParams.Delete.Objects.push({
        //@ts-ignore
        Key:content.Key})
    })
    
    if (deleteParams.Delete.Objects.length >= 1) {
      // promisify the deleteObjects() function so that we can use the async/await syntax.
      let removeObjects = promisify(s3.deleteObjects.bind(s3));
  
      await removeObjects(deleteParams)
    }


    await deleteClientBucket(clientCpf)

  // // Loop through all the object keys sent pushing them to the params object.
  // //fetchedObjectsKeys.forEach((objectKey) => deleteParams.Delete.Objects.push(objectKey));

  return true


  } catch (error) {
    console.log(error.message)
    return false
  }
}

export async function uploadTaxiDocumentsToBucket(fileName: any, createReadStream: any, clientCpf: String){
  try {

    // create an object to hold the name of the bucket, key, body, and acl of the object.
    const params = {
      Bucket: `${clientCpf}-bucket`,
      Key: '',
      Body: '',
      ACL:'public-read'
    }

    // set the body of the object as data to read from the file.
    params.Body = await createReadStream()
    

    // get the current time stamp.
    //let timestamp = new Date().getTime();

    // get the file extension.
    console.log(fileName)
    let file_extension = extname(fileName)
    
    

    // set the key as a combination of the folder name, clientCpf, and the file extension of the object.
    params.Key = `taxi-documents/${clientCpf}${file_extension}`;

    // promisify the upload() function so that we can use async/await syntax.
    let upload = promisify(s3.upload.bind(s3))

    // upload the object.
    let result = await upload(params)

    // structure the response.
    let object = {
        key:params.Key,
        url:result.Location
    };

    return object

  } catch (error) {
    console.log(error.message)
    return undefined
  }
}