
import PaymentRepo from "../repo/PaymentRepo";
import { Arg, Float, Int, Mutation, Query, Resolver } from "type-graphql";
import { PaymentResponse, RunsResponse } from "./GraphqlTypes";
import RunRepo from "../repo/RunRepo";

declare module "express-session" { // about this module - there was a issue with session
    interface Session {            // recognizing new elements in it, so its needed to do
      userId: number;            // this black magic here
    }
 }

@Resolver()
export class PaymentResolver{

    @Mutation(()=> PaymentResponse)
    async createPayment(
        @Arg('price', () => Float) price: number,
        @Arg('id_client', () => Int) id_client: number
    ):Promise<PaymentResponse>{
        try{
            const result = await PaymentRepo.createPayment(price, id_client);
            return{
                payment: result
            };

        }catch(error){
            return{
                errors: "Something bad happened"
            }
        }
    }

    @Query(()=> RunsResponse)
    async paymentOpen(
        @Arg('id_client', ()=> Int) id_client: number
    ):Promise<RunsResponse>{
        try{
            const result = await RunRepo.getPaymentRunsOpen(id_client);
            return{
                runs: result
            }
        }catch(error){
            return{
                errors: error
            }
        }
    }
}