import { MyContext } from "../types";
import { Arg, Ctx, Mutation, Resolver } from "type-graphql";
import { GraphQLUpload } from 'graphql-upload'
import { SexType, UserType } from "../entity/User";
//import clientRepo from '../repo/ClientRepo'
import { GenericError, ResponseCreateOrUpdateTaxi } from "./GraphqlTypes";
//import { Client } from "../entity/Client";
//import argon2 from 'argon2'
//import { getConnection } from "typeorm";
import { createClientBucket, deletContentAndBucketFromUser, uploadProfilePictureToBucket, uploadTaxiDocumentsToBucket } from "./resolverUtils/AwsBucketFunctions";
import { Stream } from "stream";
//import { validateClientUpdate } from "../utils/validateClientUpdate";
//import { COOKIE_NAME } from "../constants";
import { validateTaxiRegister } from "../utils/validateTaxiRegister";
import taxiRepo from "../repo/TaxiRepo";

declare module "express-session" { // about this module - there was a issue with session
  interface Session {            // recognizing new elements in it, so its needed to do
    userId: number;            // this black magic here
  }
}

interface FileUpload {
  filename: string;
  mimetype: string;
  encoding: string;
  createReadStream(): () => Stream;
}


@Resolver()
export class TaxiResolver{

  @Mutation(() => ResponseCreateOrUpdateTaxi)
  async createTaxi(
    @Ctx() {req}: MyContext,
    @Arg('name', () => String) name: string,
    @Arg('email', () => String) email: string,
    @Arg('password', () => String) password: string,
    @Arg('cpf', () => String) cpf: string,
    @Arg('cnh', () => String) cnh: string,
    @Arg('registrationNumber', () => String) registrationNumber: string,
    @Arg('phone', () => String) phone: string,
    @Arg('sex', () => String) sex: SexType,
    @Arg('profilePic', () => GraphQLUpload, {nullable: true}) {createReadStream, filename}: FileUpload,
    @Arg('birthDate', () => String) birthDate: Date,
    @Arg('nickName', () => String) nickName: string,
    @Arg('userType', () => String) userType: UserType,
    @Arg('documents', () => GraphQLUpload, {nullable: true}) documents: FileUpload,
  ):Promise<ResponseCreateOrUpdateTaxi | GenericError>{

    //Verify if there is any simple error with basic arguments
    const errors = await validateTaxiRegister(nickName, email, password, phone, cpf, cnh, registrationNumber)
    if (errors) {
      return {errors}
  }
  
  let uploadPicResult, uploadDocsResult
  try {
    // Creating Bucket to keep user files
    const resultCreateBucket = await createClientBucket(cpf)

    // Deleting user in case creating bucket fails
    if (!resultCreateBucket){
        return {
          errors:[{
            field: 'profilePicLink',
            message: 'Problem with our image servers'
          }]
        }
    } else {

      uploadPicResult = await uploadProfilePictureToBucket(filename, createReadStream, cpf)

      if (!uploadPicResult){
        await deletContentAndBucketFromUser(cpf)
        return {
          errors:[{
            field: 'profilePicLink',
            message: 'Problem while uploading profile piture'
          }]
        }
      } else {
        uploadDocsResult = await uploadTaxiDocumentsToBucket(documents.filename, documents.createReadStream, cpf)
        
        if (!uploadDocsResult) {
          await deletContentAndBucketFromUser(cpf)
          return {
            errors:[{
              field:'documents',
              message: 'Problem while uploading docuemnts'
            }]
          }
        }
      }
    }
  }catch (error) {
    console.log(error.message)
    
  }
  const newTaxi = await taxiRepo.CreateTaxi(
    name,
    email,
    password,
    cpf,
    cnh,
    registrationNumber,
    phone,
    sex,
    // @ts-ignore
    uploadPicResult.url as string,
    birthDate,
    nickName,
    userType,
    // @ts-ignore
    uploadDocsResult.url
  )

  req.session.userId = newTaxi!.id // After register, lon in

  return{
    taxi: newTaxi
  }

  // @Mutation(() => ResponseCreateOrUpdateClient)
  // async updateClient(
  //   //@Ctx() {req}: MyContext,
  //   @Arg('id_client', () => Int) id_client: number,
  //   @Arg('name', () => String) name: string,
  //   @Arg('email', () => String) email: string,
  //   @Arg('cpf', () => String) cpf: string,
  //   @Arg('phone', () => String) phone: string,
  //   @Arg('sex', () => String) sex: SexType,
  //   @Arg('profilePic', () => GraphQLUpload, {nullable: true}) {createReadStream, filename}: FileUpload,
  //   @Arg('birthDate', () => String) birthDate: Date,
  //   @Arg('nickName', () => String) nickName: string,
  //   @Arg('userType', () => String) userType: UserType,
  // ):Promise<ResponseCreateOrUpdateClient | GenericError>{

  //   let client = await clientRepo.getClientById(id_client)
  //   if (!client){
  //     return {
  //       errors: [{
  //         field: "id_client",
  //         message: "The client requesting to be updated dont exist on the database"
  //       }]
  //     }
  //   }

  //   //Verify if there is any simple error with basic arguments
  //   const errors = await validateClientUpdate(nickName, email, phone, cpf)
  //   if (errors) {
  //     return {errors}
  // }

  // // let client: any;
  // try {

  //   const clientPic = await fetchProfilePictureToBucket(client.cpf)
  //   const clientPicKey = clientPic[0].key

  //   await deleteFileFromClientBucket(client.cpf, clientPicKey)

  //   const uploadPicResult = await uploadProfilePictureToBucket(filename, createReadStream, cpf)

  //   if (!uploadPicResult){
  //     await deleteClientBucket(cpf)
  //     return {
  //       errors:[{
  //         field: 'profilePicLink',
  //         message: 'Problem while uploading profile piture'
  //       }]
  //     }
  //   }
    
  //   // Updating client on databse
  //   await clientRepo.updateClient(
  //     id_client,
  //     name,
  //     email,
  //     cpf,
  //     phone,
  //     sex,
  //     uploadPicResult.url as string,
  //     birthDate,
  //     nickName,
  //     userType
  //   )

  //   //client = await Client.findOne({where: {id: id_client}})
  //   client = await clientRepo.getClientById(id_client)

  // }catch (error) {
  //   console.log(error.message)
  // }
  // return {
  //     client: client
  //   }
  // }

  // // @Mutation(() => Boolean)
  // // async updateClientProfilePic(
  // //   @Arg('id_client', () => Int) id_client: number,
  // //   @Arg('profilePic', () => GraphQLUpload, {nullable: true}) {createReadStream, filename}: FileUpload,
  // // ){
  // //   const client = await Client.findOne({where:{id:id_client}})

  // //   if (!client) {
  // //     return false
  // //   }

  // //   try {
  // //     const clientPic = await fetchProfilePictureToBucket(client.name, client.cpf)
  // //     const clientPicKey = clientPic[0].key

  // //     await deleteFileFromClientBucket(client.name, client.cpf, clientPicKey)

  // //     const uploadPicResult = await uploadProfilePictureToBucket(filename, createReadStream, client.name, client.cpf)
  // //     console.log(uploadPicResult)
  // //     return true
  // //   } catch (error) {
  // //     return false
  // //   }
    
  // // }

  // // @Query(() => Boolean)
  // // async getUsetProfilePic(
  // //   @Arg('id_client', () => Int) id_client: number,
  // // ){
  // //   const client = await Client.findOne({where:{id:id_client}})

  // //   if (!client) {
  // //     return false
  // //   }
  // //   const clientPic = await fetchProfilePictureToBucket(client.name, client.cpf)
  // //   return true
  // // }

  // @Mutation(() => Boolean || GenericError)
  // async deleteClientById(
  //   @Arg('id_client', () => Int) id_client: number
  // ){

  //   const client = await Client.findOne({where:{id:id_client}})

  //   if (!client) {
  //     return true
  //   }

  //   try {

  //     const clientPic = await fetchProfilePictureToBucket(client.cpf)
  //     const clientPicKey = clientPic[0].key

  //     await deleteFileFromClientBucket(client.cpf, clientPicKey)

  //     const resultDeleteBucket = await deleteClientBucket(client.cpf)

  //     if(resultDeleteBucket){
  //       Client.delete(id_client)
  //       return true
  //     }
  //     return false
      
  //   } catch (error) {
  //     return false
  //   }
  // }

  // @Query(() => [Client] || GenericError)
  // async getClients(){
  //   try{

  //     const clients = await Client.find();
  //     return clients;

  //   }catch(error){
  //      return {
  //        message: error.message
  //      }
  //   }
  // }

  // @Query(() => Client || GenericError)
  // async getClientById(
  //   @Arg('id_client', () => Int) id_client: number
  // ){
  //   try {
  //     const client = await Client.findOne({where: {id:id_client}});
  //     return client;
  //   } catch (error) {
  //     return {
  //       message: error.message
  //     }
  //   }
  // }
  
  // @Mutation(() => ResponseCreateOrUpdateClient)
  // async loginClient(
  //   @Ctx() {req}: MyContext,
  //   @Arg('cpfOrEmail', () => String) cpfOrEmail: string, 
  //   @Arg('password', () => String) password: string,
  //   ): Promise<ResponseCreateOrUpdateClient>{
      
  //     const client = await clientRepo.findClientByCpfOrEmail(cpfOrEmail)
      
  //     if (!client){
  //       return {
  //         errors: [{
  //           field: 'cpfOrEmail',
  //           message: "CPF rr Email doesn't exist"
  //         }]
  //       }
  //     }

  //     const valid = await argon2.verify(client.hashed_password, password)

  //     if(!valid){
  //       return {
  //         errors: [{
  //           field: 'password',
  //           message: "Incorrect password"
  //         }]
  //       }
  //     }

  //     req.session.userId = client.id

  //     return {
  //       client: client
  //     }
  // }
  
  // @Mutation(() => Boolean)
  // async logoutClient(
  //   @Ctx() {req, res}: MyContext
  //   ): Promise<Boolean>{
  //     return new Promise(resolve => req.session.destroy(err => {
  //       res.clearCookie(COOKIE_NAME)
  //       if (err) {
  //         console.log(err)
  //         resolve(false)
  //         return
  //       }
  //       // If nothing went wrong
  //       resolve(true)
  //     }))
  // }

  // @Query(() => Client, {nullable: true})
  //   async currentClient(
  //       @Ctx() {req}: MyContext
  //   ): Promise<Client | null>  {
  //       if (!req.session.userId) {
  //           // User not logged in
  //           return null
  //       }

  //       // let client = await Client.findOne({where: {id: req.session.clientId}})
  //       let client = await clientRepo.getClientById(req.session.userId)
        
  //       return client! // Exclamation is to tell that if we got here, clint will never be undefined
  //   }

  }
}