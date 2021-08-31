
import PaymentRepo from "../repo/PaymentRepo";
import { Arg, Float, Int, Mutation, Query, Resolver } from "type-graphql";
import { PaymentResponse, RunsResponse } from "./GraphqlTypes";
import RunRepo from "../repo/RunRepo";
import ClientRepo from "../repo/ClientRepo";
import { stripe } from "../stripe";
import { RUN_PRICE } from "../constants";
import "dotenv/config"

declare module "express-session" { // about this module - there was a issue with session
    interface Session {            // recognizing new elements in it, so its needed to do
      userId: number;            // this black magic here
    }
 }

@Resolver()
export class PaymentResolver{

    @Mutation(()=> PaymentResponse)
    async createPayment(
        @Arg('qtd_km', () => Float) qtd_km: number,
        @Arg('id_client', () => Int) id_client: number
    ):Promise<PaymentResponse>{
        try{

            if (qtd_km < 0) {
                return{
                    errors: "You need to provide a valid quantity of km"
                }
            }

            const client = await ClientRepo.getClientById(id_client)
            if (!client){
                return{
                    errors: "Client not found"
                }
            }

            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [{
                    // TODO: replace this with the `price` of the product you want to sell
                    price: process.env.RUN_BASIC_PRICE_ID,
                    quantity: qtd_km,
                }],
                mode: 'payment',
                // TODO- create those routes
                success_url: `/`,
                cancel_url: `/`,
            });
            

            // After payment realized
            const result = await PaymentRepo.createPayment(qtd_km * RUN_PRICE, id_client);
            return{
                payment: result,
                payment_url: session.url!
            };

        }catch(error){
            return{
                errors: "Something bad happened"
            }
        }
    }

    @Mutation(() => Boolean)
    async confirmPayment(
        @Arg("id_client", () => String) id_client: number
    ){
        try {
            const client = await ClientRepo.getClientById(id_client)
            if (!client){
                return false
            }

            const setRunResult = await RunRepo.setRunToPaid(id_client)
            return setRunResult
        
        } catch (error) {
            console.log(error.message)
            return false
        }
    }

    @Mutation(() => PaymentResponse)
    async createCashPayment(
        @Arg('id_run', ()=> Int) id_run: number,
        @Arg('id_client', ()=> Int) id_client: number,
        @Arg('qtd_km', () => Float) qtd_km: number,
    ):Promise<PaymentResponse>{
        try {

            if (qtd_km < 0) {
                return{
                    errors: "You need to provide a valid quantity of km"
                }
            }
            
            const run = await RunRepo.getRunsById(id_run)
            if (!run) {
                return{
                    errors: "Client not found"
                }
            }
            const result = await PaymentRepo.createPayment(qtd_km * RUN_PRICE, id_client);
            await RunRepo.setRunToPaid(id_client)
            return{
                payment: result
            };
        } catch (error) {
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