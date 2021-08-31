import { Arg, Float, Int, Mutation, Query, Resolver } from "type-graphql";
import { AvaliationClientResponse } from "./GraphqlTypes";
import AvaliationTaxiRepo from "../repo/AvaliationTaxiRepo";
import AvaliationClientRepo from "../repo/AvaliationClientRepo";
import ClientRepo from "../repo/ClientRepo";
import TaxiRepo from "../repo/TaxiRepo";

declare module "express-session" { // about this module - there was a issue with session
    interface Session {            // recognizing new elements in it, so its needed to do
      userId: number;            // this black magic here
    }
 }

@Resolver()
export class AvaliationClientResolver{

    @Mutation(()=> AvaliationClientResponse)
    async createAvaliationClient(
        @Arg('score', () => Float) score: number,
        @Arg('comment', () => String) comment: string,
        @Arg('id_taxi', () => Int) id_taxi: number,
        @Arg('id_client', () => Int) id_client: number
    ):Promise<AvaliationClientResponse>{
        try{
            if (score < 0) {
                return{
                    errors: "You can't give a negative score"
                }
            }

            const client = ClientRepo.getClientById(id_client)
            if (!client){
                return{
                    errors: "client not found"
                }
            }
            const taxi = TaxiRepo.getTaxiById(id_taxi)
            if (!taxi){
                return{
                    errors: "Taxi not found"
                }
            }
            
            const result = await AvaliationClientRepo.createAvaliationClient(score, comment, id_taxi, id_client);
            return{
                avaliationClient: result
            };

        }catch(error){
            return{
                errors: "Something bad happened"
            }
        }
    }

    @Query(()=> AvaliationClientResponse)
    async getAvaliationClient(
        @Arg('id_taxi', ()=> Int) id_taxi: number
    ):Promise<AvaliationClientResponse>{
        try{
            const result = await AvaliationTaxiRepo.getAllAvatiationTaxi(id_taxi);
            return{
                avaliationClients: result
            }
        }catch(error){
            return{
                errors: "Something bad happened"
            }
        }
    }

    @Query(()=> AvaliationClientResponse)
    async getAvaliationClientById(
        @Arg('id_taxi', ()=> Int) id_taxi: number
    ):Promise<AvaliationClientResponse>{
        try{
            const result = await AvaliationClientRepo.getAllAvatiationClientById(id_taxi);
            return{
                avaliationClient: result
            }
        }catch(error){
            return{
                errors: "Something bad happened"
            }
        }
    }

}