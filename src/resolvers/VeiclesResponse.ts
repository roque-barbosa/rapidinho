import { Arg, Mutation, Query, Resolver, Int } from "type-graphql";
import { GenericError, VeicleResponse } from "./GraphqlTypes";
import { Veicle } from "../entity/Veicle";
import VeiclesRepo from "../repo/VeiclesRepo";
//import { Veicle } from "../entity/Veicle";
//import { Run } from "../entity/Run";
//import { Veicle } from "src/entity/Veicle";

declare module "express-session" { // about this module - there was a issue with session
  interface Session {            // recognizing new elements in it, so its needed to do
    userId: number;            // this black magic here
  }
}

@Resolver()
export class VeicleResolver{

  @Mutation(() => Boolean || GenericError)
  async deleteVeicleById(
    @Arg('id_veicle', () => Int) id_veicle: number
  ){
    try {
        Veicle.delete(id_veicle)
      return true
    } catch (error) {
      return {
        message:error.message
      }
    }
  }

  @Query(() => VeicleResponse)
  async getVeiclesByTaxi(
    @Arg('id_taxi', () => Int) id_taxi: number
  ):Promise<VeicleResponse>{
    try{

      const veicles = await VeiclesRepo.getVeiclesByTaxi(id_taxi);
      return{
        veicles: veicles
      };

    }catch(error){
       return {
         errors: "Somethin bad happened"
       }
    }
  }

  @Query(() => VeicleResponse)
  async getVeicleById(
    @Arg('id_veicle', () => Int) id_veicle: number
  ):Promise<VeicleResponse>{
    try{

      const veicles = await VeiclesRepo.getVeicleById(id_veicle);
      return{
        veicle: veicles
      }

    }catch(error){
       return {
         errors: "Somethin bad happened"
       }
    }
  }

}