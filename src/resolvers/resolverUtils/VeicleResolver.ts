import { GraphQLUpload } from "graphql-upload";
import { VeicleColor, VeicleType } from "../../entity/Veicle";
import { Stream } from "stream";
import { Arg, Int, Mutation, Resolver } from "type-graphql";
import { ResponseCreateOrUpdateVeicle } from "../GraphqlTypes";
import TaxiRepo from "../../repo/TaxiRepo";
import { deleteVeicleDocuemntsFromBucket, uploadVeicleDocumentsToBucket } from "./AwsBucketFunctions";
import veicleRepo from "../../repo/VeicleRepo";

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
export class VeicleResolvers{
  @Mutation(() => ResponseCreateOrUpdateVeicle)
  async createVeicle(
    @Arg('plaque', () => String) plaque: string,
    @Arg('id_taxi', () => Int) id_taxi: number,
    @Arg('model', () => String) model: string,
    @Arg('veicleColor', () => String) veicleColor: VeicleColor,
    @Arg('veicleType', () => String) veicleType: VeicleType,
    @Arg('crvVeicle', () => GraphQLUpload, {nullable: true}) {createReadStream, filename}: FileUpload,
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

      veicle = await veicleRepo.createVeicle(plaque, taxi, model, veicleColor, veicleType, uploadCrvResult.url)
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

    const veicle = await veicleRepo.getVeicleById(id_veicle)
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
}