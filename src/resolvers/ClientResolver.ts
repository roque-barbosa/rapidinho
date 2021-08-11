import { MyContext } from "../types";
import { Arg, Ctx, Mutation, Query, Resolver, Int } from "type-graphql";
import { SexType, UserType } from "../entity/User";
import { validateClientRegister } from "../utils/validateClientRegister";
import { GenericError, ResponseCreateOrUpdateClient } from "./GraphqlTypes";
import { Client } from "../entity/Client";
import argon2 from 'argon2'
import { getConnection } from "typeorm";

declare module "express-session" { // about this module - there was a issue with session
  interface Session {            // recognizing new elements in it, so its needed to do
    userId: number;            // this black magic here
  }
}

@Resolver()
export class ClientResolver{

  @Mutation(() => ResponseCreateOrUpdateClient || GenericError)
  async createClient(
    @Ctx() {req}: MyContext,
    @Arg('name', () => String) name: string,
    @Arg('email', () => String) email: string,
    @Arg('password', () => String) password: string,
    @Arg('cpf', () => String) cpf: string,
    @Arg('phone', () => String) phone: string,
    @Arg('sex', () => String) sex: SexType,
    //@Arg('profilePicLink', () => String, {nullable: true}) profilePicLink: string,
    @Arg('birthDate', () => String) birthDate: Date,
    @Arg('nickName', () => String) nickName: string,
    @Arg('userType', () => String) userType: UserType,
  ):Promise<ResponseCreateOrUpdateClient | GenericError>{

    //Verify if there is any simple error with basic arguments
    const errors = await validateClientRegister(nickName, email, password, phone, cpf)
    if (errors) {
      return {errors}
  }

  let client: any;
  try {
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
        birthDate: birthDate,
        nickName: nickName,
        userType: userType
      })
      .execute()

    client = await Client.findOne({where: {id: result.raw.insertId}})

  }catch (error) {
    return {
      message:error.message
    }
  }

  req.session.userId = client!.id // After register, lon in
  return {
      client: client
    }
  }

  @Mutation(() => Boolean || GenericError)
  async deleteClientById(
    @Arg('id_client', () => Int) id_client: number
  ){
    try {
      Client.delete(id_client)
      return true
    } catch (error) {
      return {
        message:error.message
      }
    }
  }

  @Query(() => [Client] || GenericError)
  async getClients(
  ){
    try{

      const clients = await Client.find();
      return clients;

    }catch(error){
       return {
         message: error.message
       }
    }
  }

  @Query(() => Client || GenericError)
  async getClientById(
    @Arg('id_client', () => Int) id_client: number
  ){
    try {
      const client = await Client.findOne({where: {id:id_client}});
      return client;
    } catch (error) {
      return {
        message: error.message
      }
    }
  }
  
}