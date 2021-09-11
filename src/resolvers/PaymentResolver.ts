
import PaymentRepo from "../repo/PaymentRepo";
import { Arg, Float, Int, Mutation, Query, Resolver } from "type-graphql";
import { PaymentResponse, RunsResponse } from "./GraphqlTypes";
import RunRepo from "../repo/RunRepo";
import ClientRepo from "../repo/ClientRepo";
import { RUN_PRICE } from "../constants";

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
            const client = await ClientRepo.getClientById(id_client)
            if (!client){
                return{
                    errors: "Client not found"
                }
            }
/*
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [{
                    // TODO: replace this with the `price` of the product you want to sell
                    price: `price_1JKWxEKCMhVSKfjsmP5Pprmr`,
                    quantity: qtd_km,
                }],
                mode: 'payment',
                // TODO- create those routes
                success_url: `${process.env.MY_DOMAIN}/payment_success`,
                cancel_url: `${process.env.MY_DOMAIN}/payment_failed`,
            });
      */      

            // After payment realized
            const result = await PaymentRepo.createPayment(qtd_km * RUN_PRICE, id_client, 0);
            return{
                payment: result,
                //payment_url: session.url!
            };

        }catch(error){
            return{
                errors: "Something bad happened"
            }
        }
    }

    @Mutation(() => Boolean)
    async confirmPayment(
        @Arg("id_client", () => Int) id_client: number
    ){
        try {
            const client = await ClientRepo.getClientById(id_client)
            if (!client){
                return false
            }

            return await RunRepo.setRunToPaid(id_client)
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
            const result = await PaymentRepo.createPayment(qtd_km * RUN_PRICE, id_client, 1);
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

    @Query(()=> PaymentResponse)
    async getYield(
        @Arg('data_initial', ()=> String) data_initial: string,
        @Arg('data_final', ()=> String) data_final: string
    ):Promise<PaymentResponse>{
        try{
            const result = await PaymentRepo.getPaymentYield(data_initial, data_final);
            return{
                payments: result
            }
        }catch(error){
            return{
                errors: error
            }
        }
    }
}