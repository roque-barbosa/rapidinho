import { promisify } from 'util';
import s3 from '../aws'

export async function getBucketUrl(clientName: String, clientCpf: String, key: String){

  const params = {
      Bucket:`${clientCpf}-${clientName}`,
      Key:key
  };

  let getObject = promisify(s3.getSignedUrl.bind(s3));

  let result = await getObject('getObject',params).catch(console.log);

  result = result.split('?')[0];

  return result;
  
};
