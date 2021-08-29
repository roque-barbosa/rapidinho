import { Arg, Float, Int, Mutation, Query, Resolver } from "type-graphql";
import { AvaliationTaxiResponse } from "./GraphqlTypes";
import AvaliationTaxiRepo from "../repo/AvaliationTaxiRepo";
import ClientRepo from "../repo/ClientRepo";
import TaxiRepo from "../repo/TaxiRepo";

declare module "express-session" { // about this module - there was a issue with session
    interface Session {            // recognizing new elements in it, so its needed to do
      userId: number;            // this black magic here
    }
 }

@Resolver()
export class AvaliationTaxiResolver{

    @Mutation(()=> AvaliationTaxiResponse)
    async createAvaliationTaxi(
        @Arg('score', () => Float) score: number,
        @Arg('comment', () => String) comment: string,
        @Arg('id_taxi', () => Int) id_taxi: number,
        @Arg('id_client', () => Int) id_client: number
    ):Promise<AvaliationTaxiResponse>{
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

            const result = await AvaliationTaxiRepo.createAvaliationTaxi(score, comment, id_taxi, id_client);
            return{
                avaliationTaxi: result
            };

        }catch(error){
            return{
                errors: "Something bad happened"
            }
        }
    }

    @Query(()=> AvaliationTaxiResponse)
    async getAvaliationTaxi(
        @Arg('id_taxi', ()=> Int) id_taxi: number
    ):Promise<AvaliationTaxiResponse>{
        try{
            const result = await AvaliationTaxiRepo.getAllAvatiationTaxi(id_taxi);
            return{
                avaliationTaxis: result
            }
        }catch(error){
            return{
                errors: "Something bad happened"
            }
        }
    }

    @Query(()=> AvaliationTaxiResponse)
    async getAvaliationTaxiById(
        @Arg('id_avaliation', ()=> Int) id_avaliation: number
    ):Promise<AvaliationTaxiResponse>{
        try{
            const result = await AvaliationTaxiRepo.getAllAvatiationTaxiById(id_avaliation);
            return{
                avaliationTaxi: result
            }
        }catch(error){
            return{
                errors: "Something bad happened"
            }
        }
    }

}