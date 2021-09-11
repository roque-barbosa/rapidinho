import { Arg, Mutation, Query, Resolver, Int } from "type-graphql";
import { ResponseCreateOrUpdateVeicle, VeicleResponse } from "./GraphqlTypes";
import { VeicleColor, VeicleType } from "../entity/Veicle";
import VeiclesRepo from "../repo/VeiclesRepo";
import { deleteVeicleDocuemntsFromBucket, uploadVeicleDocumentsToBucket } from "./resolverUtils/AwsBucketFunctions";
import TaxiRepo from "../repo/TaxiRepo";
import VeicleRepo from "../repo/VeicleRepo";
import { FileUploadUrls } from "aws-sdk/clients/amplify";
import { GraphQLUpload } from "graphql-upload";
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

  @Mutation(() => ResponseCreateOrUpdateVeicle)
  async createVeicle(
    @Arg('plaque', () => String) plaque: string,
    @Arg('id_taxi', () => Int) id_taxi: number,
    @Arg('model', () => String) model: string,
    @Arg('veicleColor', () => String) veicleColor: VeicleColor,
    @Arg('veicleType', () => String) veicleType: VeicleType,
    @Arg('crvVeicle', () => GraphQLUpload, {nullable: true}) {createReadStream, filename}: FileUploadUrls,
  ):Promise<ResponseCreateOrUpdateVeicle>{

    const taxi = await TaxiRepo.getTaxiById(id_taxi)
    if (!taxi) {
      return{
        errors:[{
          field: 'id_taxi',
          message: `taxi with the id ${id_taxi} does not exist`
        }]
      }
    }

    let veicle
    try {
      const uploadCrvResult = await uploadVeicleDocumentsToBucket(filename, createReadStream, taxi.cpf, plaque)

      if (!uploadCrvResult) {
        return {
          errors:[{
            field: 'crvVeicle',
            message: 'Problem with our image servers'
          }]
        }
      }

      veicle = await VeicleRepo.createVeicle(plaque, taxi, model, veicleColor, veicleType, uploadCrvResult.url)
    } catch (error) {
      console.log(error.message)
    }

    return {
      veicle: veicle
    }
  }

  @Mutation(() => Boolean)
  async deleteVeicle(
    @Arg('id_veicle', ()=> Int) id_veicle: number,
    @Arg('id_taxi', ()=> Int) id_taxi: number
  ){
    const taxi = await TaxiRepo.getTaxiById(id_taxi)
    if (!taxi) {
      return false
    }

    const veicle = await VeiclesRepo.getVeicleById(id_veicle)
    if (!veicle) {
      return false
    }

    try {
      await deleteVeicleDocuemntsFromBucket(taxi.cpf, veicle.licensePlate)
      return true
    } catch (error) {
      return false
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

  @Query(() => VeicleResponse)
  async getVeicles(
  ):Promise<VeicleResponse>{
    try{

      const veicles = await VeiclesRepo.getVeicles();
      return{
        veicles: veicles 
      }

    }catch(error){
       return {
         errors: "Somethin bad happened"
       }
    }
  }

}