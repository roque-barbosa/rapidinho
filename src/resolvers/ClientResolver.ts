import { MyContext } from "../types";
import { Arg, Ctx, Mutation, Query, Resolver, Int } from "type-graphql";
import { GraphQLUpload } from 'graphql-upload'
import { SexType, UserType } from "../entity/User";
import clientRepo from '../repo/ClientRepo'
import { validateClientRegister } from "../utils/validateClientRegister";
import { GenericError, ResponseCreateOrUpdateClient } from "./GraphqlTypes";
import { Client } from "../entity/Client";
import argon2 from 'argon2'
import { getConnection } from "typeorm";
import { Stream } from "stream";
import { validateClientUpdate } from "../utils/validateClientUpdate";
import { COOKIE_NAME } from "../constants";

import AwsManager from '../AwsManager'
import {extname} from "path";
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
export class ClientResolver {

  @Mutation(() => ResponseCreateOrUpdateClient)
  async createClient(
    @Ctx() { req }: MyContext,
    @Arg('name', () => String) name: string,
    @Arg('email', () => String) email: string,
    @Arg('password', () => String) password: string,
    @Arg('cpf', () => String) cpf: string,
    @Arg('phone', () => String) phone: string,
    @Arg('sex', () => String) sex: SexType,
    @Arg('profilePic', () => GraphQLUpload, { nullable: true }) {createReadStream, filename}: FileUpload,
    @Arg('birthDate', () => String) birthDate: Date,
    @Arg('nickName', () => String) nickName: string,
    @Arg('userType', () => String) userType: UserType,
  ): Promise<ResponseCreateOrUpdateClient | GenericError> {

    //const {createReadStream, filename, mimetype, encoding} = await file

    //Verify if there is any simple error with basic arguments
    const errors = await validateClientRegister(nickName, email, password, phone, cpf)
    if (errors) {
      return { errors }
    }

    let client: any;
    try {

      new Promise(async (resolve, reject) => {
        createReadStream()
          .pipe(createWriteStream(__dirname + `/../../temp/images/${filename}`))
          .on("finish", () => resolve(true))
          .on("error", (err: any) => {
            console.log(err)
            reject(false)
          })
      });
      
      const uploadResultUrl = await AwsManager.sendFileToBucket(filename, `client/${cpf}/profile-picture/profile-picture${extname(filename)}`)
      
      if (!uploadResultUrl) {
        return {
          errors: [{
            field: 'profilePicLink',
            message: 'Problem while uploading profile piture'
          }]
        }
      }

      // Adding CLient do databse
      const result = await getConnection()
        .createQueryBuilder()
        .insert()
        .into(Client)
        .values({
          name: name,
          email: email,
          hashed_password: await argon2.hash(password),
          cpf: cpf,
          phone: phone,
          sex: sex,
          // @ts-ignore
          profilePicLink: uploadResultUrl,
          birthDate: birthDate,
          nickName: nickName,
          userType: userType
        })
        .execute()

      client = await Client.findOne({ where: { id: result.raw.insertId } })

    } catch (error) {
      console.log(error.message)
    }

    req.session.userId = client!.id // After register, lon in
    return {
      client: client
    }
  }

  @Mutation(() => ResponseCreateOrUpdateClient)
  async updateClient(
    //@Ctx() {req}: MyContext,
    @Arg('id_client', () => Int) id_client: number,
    @Arg('name', () => String) name: string,
    @Arg('email', () => String) email: string,
    @Arg('cpf', () => String) cpf: string,
    @Arg('phone', () => String) phone: string,
    @Arg('sex', () => String) sex: SexType,
    @Arg('profilePic', () => GraphQLUpload, { nullable: true }) profilePic: FileUpload,
    @Arg('birthDate', () => String) birthDate: Date,
    @Arg('nickName', () => String) nickName: string,
    @Arg('userType', () => String) userType: UserType,
  ): Promise<ResponseCreateOrUpdateClient | GenericError> {

    let client = await clientRepo.getClientById(id_client)
    if (!client) {
      return {
        errors: [{
          field: "id_client",
          message: "The client requesting to be updated dont exist on the database"
        }]
      }
    }

    //Verify if there is any simple error with basic arguments
    const errors = await validateClientUpdate(nickName, email, phone, cpf)
    if (errors) {
      return { errors }
    }

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

      const uploadResultUrl = await AwsManager.sendFileToBucket(profilePic.filename, `client/${cpf}/profile-picture/profile-picture${extname(profilePic.filename)}`)
      console.log(uploadResultUrl)
      if (!uploadResultUrl) {
        return {
          errors: [{
            field: 'profilePicLink',
            message: 'Problem while uploading profile piture'
          }]
        }
      }

      // Updating client on databse
      await clientRepo.updateClient(
        id_client,
        name,
        email,
        cpf,
        phone,
        sex,
        uploadResultUrl,
        birthDate,
        nickName,
        userType
      )

      client = await clientRepo.getClientById(id_client)

    } catch (error) {
      console.log(error.message)
    }
    return {
      client: client
    }
  }

  // @Mutation(() => Boolean)
  // async updateClientProfilePic(
  //   @Arg('id_client', () => Int) id_client: number,
  //   @Arg('profilePic', () => GraphQLUpload, {nullable: true}) {createReadStream, filename}: FileUpload,
  // ){
  //   const client = await Client.findOne({where:{id:id_client}})

  //   if (!client) {
  //     return false
  //   }

  //   try {
  //     const clientPic = await fetchProfilePictureToBucket(client.name, client.cpf)
  //     const clientPicKey = clientPic[0].key

  //     await deleteFileFromClientBucket(client.name, client.cpf, clientPicKey)

  //     const uploadPicResult = await uploadProfilePictureToBucket(filename, createReadStream, client.name, client.cpf)
  //     console.log(uploadPicResult)
  //     return true
  //   } catch (error) {
  //     return false
  //   }

  // }

  // @Query(() => Boolean)
  // async getUsetProfilePic(
  //   @Arg('id_client', () => Int) id_client: number,
  // ){
  //   const client = await Client.findOne({where:{id:id_client}})

  //   if (!client) {
  //     return false
  //   }
  //   const clientPic = await fetchProfilePictureToBucket(client.name, client.cpf)
  //   return true
  // }

  @Mutation(() => Boolean || GenericError)
  async deleteClientById(
    @Arg('id_client', () => Int) id_client: number
  ) {

    const client = await Client.findOne({ where: { id: id_client } })

    if (!client) {
      return true
    }

    try {

      const resultDeleteFiles = await AwsManager.deleteFileFromBucket(`client/${client.cpf}/profile-picture/profile-picture.pdf`)



      if (resultDeleteFiles) {
        Client.delete(id_client)
        return true
      }
      return false

    } catch (error) {
      return false
    }
  }

  @Query(() => [Client] || GenericError)
  async getClients() {
    try {

      const clients = await Client.find();
      return clients;

    } catch (error) {
      return {
        message: error.message
      }
    }
  }

  @Query(() => Client || GenericError)
  async getClientById(
    @Arg('id_client', () => Int) id_client: number
  ) {
    try {
      const client = await Client.findOne({ where: { id: id_client } });
      return client;
    } catch (error) {
      return {
        message: error.message
      }
    }
  }

  @Query(() => Client || GenericError)
  async getClientByCpf(
    @Arg('cpf_client', () => String) cpf_client: string
  ) {
    try {
      const client = await Client.findOne({ where: { cpf: cpf_client } });
      return client;
    } catch (error) {
      return {
        message: error.message
      }
    }
  }

  @Mutation(() => ResponseCreateOrUpdateClient)
  async loginClient(
    @Ctx() { req }: MyContext,
    @Arg('cpfOrEmail', () => String) cpfOrEmail: string,
    @Arg('password', () => String) password: string,
  ): Promise<ResponseCreateOrUpdateClient> {

    const client = await clientRepo.findClientByCpfOrEmail(cpfOrEmail)

    if (!client) {
      return {
        errors: [{
          field: 'cpfOrEmail',
          message: "CPF rr Email doesn't exist"
        }]
      }
    }

    const valid = await argon2.verify(client.hashed_password, password)

    if (!valid) {
      return {
        errors: [{
          field: 'password',
          message: "Incorrect password"
        }]
      }
    }

    req.session.userId = client.id

    return {
      client: client
    }
  }

  @Mutation(() => Boolean)
  async logoutClient(
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

  @Query(() => Client, { nullable: true })
  async currentClient(
    @Ctx() { req }: MyContext
  ): Promise<Client | null> {
    if (!req.session.userId) {
      // User not logged in
      return null
    }

    // let client = await Client.findOne({where: {id: req.session.clientId}})
    let client = await clientRepo.getClientById(req.session.userId)

    return client! // Exclamation is to tell that if we got here, clint will never be undefined
  }
}