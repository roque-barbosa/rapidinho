import { Arg, Query, Resolver } from "type-graphql";
import { UserResponse } from "./GraphqlTypes";
import UserRepo from "../repo/UserRepo";

declare module "express-session" { // about this module - there was a issue with session
  interface Session {            // recognizing new elements in it, so its needed to do
    userId: number;            // this black magic here
  }
}

@Resolver()
export class UserResolver{

  @Query(() => UserResponse)
  async loginUser(
      @Arg('login', () => String) login: string,
      @Arg('password', () => String) password: string,
  ):Promise<UserResponse>{
    try{
      const logi = await UserRepo.login(login, password);
      return logi;
    }catch(error){
      console.log("Saida");
      return{
        errors: "password must be greater than 2"
      }
    }
  }

  
}