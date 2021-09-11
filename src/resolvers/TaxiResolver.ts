import { MyContext } from "../types";
import { Arg, Ctx, Int, Mutation, Query, Resolver } from "type-graphql";
import { GraphQLUpload } from 'graphql-upload'
import { SexType, UserType } from "../entity/User";
import { GenericError, ResponseCreateOrUpdateTaxi, TaxiResponse, updateFilesResponse } from "./GraphqlTypes";
import argon2 from 'argon2'
import { Stream } from "stream";
import { COOKIE_NAME } from "../constants";
import { validateTaxiRegister } from "../utils/validateTaxiRegister";
import taxiRepo from "../repo/TaxiRepo";
import TaxiRepo from "../repo/TaxiRepo";
import { Taxi } from "../entity/Taxi";
import AwsManager from "../AwsManager";
import { extname } from "path";
import { createWriteStream } from "fs";

declare module "express-session" { // about this module - there was a issue with session
  interface Session {            // recognizing new elements in it, so its needed to do
    userId: number;            // this black magic here
  }
}

interface FileUpload {
  filename: string;
  mimetype: string;
  encoding: string;
  createReadStream: () => Stream;
}


@Resolver()
export class TaxiResolver {

  @Mutation(() => ResponseCreateOrUpdateTaxi)
  async createTaxi(
    @Ctx() { req }: MyContext,
    @Arg('name', () => String) name: string,
    @Arg('email', () => String) email: string,
    @Arg('password', () => String) password: string,
    @Arg('cpf', () => String) cpf: string,
    @Arg('cnh', () => String) cnh: string,
    @Arg('registrationNumber', () => String) registrationNumber: string,
    @Arg('phone', () => String) phone: string,
    @Arg('sex', () => String) sex: SexType,
    @Arg('profilePic', () => GraphQLUpload, { nullable: true }) profilePic: FileUpload,
    @Arg('birthDate', () => String) birthDate: Date,
    @Arg('nickName', () => String) nickName: string,
    @Arg('userType', () => String) userType: UserType,
  ): Promise<ResponseCreateOrUpdateTaxi | GenericError> {


    //Verify if there is any simple error with basic arguments
    const errors = await validateTaxiRegister(nickName, email, password, phone, cpf, cnh, registrationNumber)
    if (errors) {
      return { errors }
    }


    let taxi: any

    try {

      new Promise(async (resolve, reject) => {
        profilePic.createReadStream()
          .pipe(createWriteStream(__dirname + `/../../temp/images/${profilePic.filename}`))
          .on("finish", () => resolve(true))
          .on("error", (err: any) => {
            console.log(err)
            reject(false)
          })
      });
      
      const uploadResultUrl = await AwsManager.sendFileToBucket(profilePic.filename, `taxi/${cpf}/profile-picture/profile-picture${extname(profilePic.filename)}`)
      
      if (!uploadResultUrl) {
        return {
          errors: [{
            field: 'profilePicLink',
            message: 'Problem while uploading profile piture'
          }]
        }
      }

      const newtaxi = await taxiRepo.CreateTaxi(
        name,
        email,
        password,
        cpf,
        cnh,
        registrationNumber,
        phone,
        sex,
        'uploadPicResult as string',
        birthDate,
        nickName,
        userType,
        '',
      )

      taxi = newtaxi
  
      req.session.userId = taxi!.id // After register, lon in
  
    } catch (error) {
      console.log(error.message)
    }

    return {
      taxi: taxi
    }
  }

  @Mutation(() => updateFilesResponse)
  async updaloadTaxiFiles(
    @Arg('id_taxi', () => Int) id_taxi: number,
    @Arg('documents', () => GraphQLUpload, { nullable: true }) documents: FileUpload,
  ): Promise<updateFilesResponse> {
    const taxi = await taxiRepo.getTaxiById(id_taxi)
    if (!taxi) {
      return {
        errors: [{
          field: 'id_taxi',
          message: 'A taxi with this ID does not exist'
        }]
      }
    }

    try {
      new Promise(async (resolve, reject) => {
        documents.createReadStream()
          .pipe(createWriteStream(__dirname + `/../../temp/images/${documents.filename}`))
          .on("finish", () => resolve(true))
          .on("error", (err: any) => {
            console.log(err)
            reject(false)
          })
      });
      
      const uploadResultUrl = await AwsManager.sendFileToBucket(documents.filename, `taxi/${taxi.cpf}/documents/documents${extname(documents.filename)}`)
      if (uploadResultUrl) {
        return {
          fileUrl: uploadResultUrl
        }
      }
      
    } catch (error) {
      
    }
    
    return {
      errors:[]
    }
  }

  @Mutation(() => Boolean || GenericError)
  async deleteTaxiById(
    @Arg('id_taxi', () => Int) id_taxi: number
  ) {

    const taxi = await taxiRepo.getTaxiById(id_taxi)

    if (!taxi) {
      return true
    }

    try {

      const taxiFiles = await AwsManager.fetchFilesFromBucket(`taxi/${taxi.cpf}/`)
      const resultDeleteFiles = await AwsManager.deleteMultipleFilesFromBucket(taxiFiles)
      console.log(taxiFiles)
      if (resultDeleteFiles) {
        return true
      }
      return false

    } catch (error) {
      return false
    }

  }

  @Mutation(() => Int)
  async taxiUpdateStatus(
    @Arg('id_taxi', () => Int) id_taxi: number,
    @Arg('status', () => Int) status: number,
  ){
    try {

      await TaxiRepo.updateStatus(id_taxi, status);
      
      return 1

    } catch (error) {
      return -1;
    }
  }

  @Mutation(() => Int)
  async taxiUpdateForEmpoyee(
    @Arg('id_taxi', () => Int) id_taxi: number,
    @Arg('email', () => String) email: string,
    @Arg('password', () => String) password: string,
    @Arg('name', () => String) name: string,
    @Arg('nickName', () => String) nickName: string
  ){
    try {

      const taxi = await TaxiRepo.getTaxiById(id_taxi);
      if(taxi == null){
        return -3;
      }

      const ret = await TaxiRepo.updateTaxiForEmployee(id_taxi, email, password, name, nickName);
      
      return ret;

    } catch (error) {
      return 0;
    }
  }

  @Query(() => TaxiResponse)
  async getTaxiById(
    @Arg('id_taxi', () => Int) id_taxi: number
  ): Promise<TaxiResponse> {
    try {
      const taxi = await TaxiRepo.getTaxiById(id_taxi);
      return {
        taxi: taxi
      }
    } catch (error) {
      return {
        errors: "Somethin bad happened"
      }
    }
  }

  @Query(() => TaxiResponse)
  async getTaxiByCPF(
    @Arg('cpf_taxi', () => String) cpf_taxi: string
  ): Promise<TaxiResponse> {
    try {
      const taxi = await TaxiRepo.getTaxiByCPF(cpf_taxi);
      return {
        taxis: taxi
      }
    } catch (error) {
      return {
        errors: 'Somethin bad happened'
      }
    }

  }

  @Query(() => Int || String)
  async getTaxiStatus(
    @Arg('id_taxi', () => Int) id_taxi: number
  ) {
    try {

      const result = await TaxiRepo.getTaxiById(id_taxi);

      return result?.status;

    } catch (error) {
      return "Somethin bad happened"
    }
  }

  @Query(() => TaxiResponse)
  async getTaxiByEmail(
    @Arg('email_taxi', () => String) email_taxi: string
  ): Promise<TaxiResponse> {
    try {
      const taxi = await TaxiRepo.getTaxiByEmail(email_taxi);
      return {
        taxis: taxi
      }
    } catch (error) {
      return {
        errors: 'Somethin bad happened'
      }
    }
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

  @Query(() => TaxiResponse)
  async getTaxis(): Promise<TaxiResponse> {
    try {

      const taxis = await taxiRepo.getAllTaxis()
      return {
        taxis: taxis
      }

    } catch (error) {
      return {
        errors: 'Somethin bad happened'
      }
    }
  }

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

  @Mutation(() => ResponseCreateOrUpdateTaxi)
  async loginTaxi(
    @Ctx() { req }: MyContext,
    @Arg('cpfOrEmail', () => String) cpfOrEmail: string,
    @Arg('password', () => String) password: string,
  ): Promise<ResponseCreateOrUpdateTaxi> {

    const taxi = await taxiRepo.findTaxiByCpfOrEmail(cpfOrEmail)

    if (!taxi) {
      return {
        errors: [{
          field: 'cpfOrEmail',
          message: "CPF rr Email doesn't exist"
        }]
      }
    }

    const valid = await argon2.verify(taxi.hashed_password, password)

    if (!valid) {
      return {
        errors: [{
          field: 'password',
          message: "Incorrect password"
        }]
      }
    }

    req.session.userId = taxi.id

    return {
      taxi: taxi
    }
  }

  @Mutation(() => Boolean)
  async logoutTaxi(
    @Ctx() { req, res }: MyContext
  ): Promise<Boolean> {
    return new Promise(resolve => req.session.destroy(err => {
      res.clearCookie(COOKIE_NAME)
      if (err) {
        console.log(err)
        resolve(false)
        return
      }
      // If nothing went wrong
      resolve(true)
    }))
  }

  @Query(() => Taxi, { nullable: true })
  async currentClient(
    @Ctx() { req }: MyContext
  ): Promise<Taxi | null> {
    if (!req.session.userId) {
      // User not logged in
      return null
    }

    let client = await taxiRepo.getTaxiById(req.session.userId)

    return client! // Exclamation is to tell that if we got here, client will never be undefined
  }

}