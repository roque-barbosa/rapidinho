import { Arg, Mutation, Query, Resolver, Int, Float } from "type-graphql";
import { RunStatus } from "../entity/Run";
import { GenericError, RunsResponse } from "./GraphqlTypes";
import RunRepo from "../repo/RunRepo";
import TaxiRepo from "../repo/TaxiRepo";
import { float } from "aws-sdk/clients/lightsail";
import { Taxi, TaxiStatus } from "../entity/Taxi";

declare module "express-session" { // about this module - there was a issue with session
  interface Session {            // recognizing new elements in it, so its needed to do
    userId: number;            // this black magic here
  }
}
 
@Resolver()
export class RunsResolver{

    /* ------------------------------------------ CREATE RUN ---------------------------------------------- */
  @Mutation(() => RunsResponse)
  async createRun(
    @Arg('clientCordinates', ()=> String) clientCordinates: string,
    @Arg('destinyCordinates', ()=> String) destinyCordinates: string,
    @Arg('price', ()=> Float) price: float,
    @Arg('runType', ()=> Int) runType: number,
    @Arg('runPaymentType', ()=> Int) runPaymentType: number,
    @Arg('id_taxi', ()=> Int) id_taxi: number,
    @Arg('id_client', ()=> Int) id_client: number,
  ):Promise<RunsResponse>{
    try {

      const result = await RunRepo.createRun(clientCordinates, destinyCordinates, price, runType, runPaymentType, id_taxi, id_client);
      return{
        run:result
      }
    } catch (error) {
      return {
        errors: "Somethin bad happened"
      }
    }
  }

    /* ------------------------------------------ DELETE RUN BY ID ---------------------------------------------- */

  @Mutation(() => Boolean || GenericError)
  async deleteRunById(
    @Arg('id_run', () => Int) id_run: number
  ){
    try {
      await RunRepo.deleteRun(id_run)
      return true;

    } catch (error) {
      return {
        message:"Somethin bad happened"
      }
    }
  }

    /* ------------------------------------------ ACCEPT RUN ---------------------------------------------- */

  @Mutation(() => RunsResponse)
  async runAccept(
    @Arg('id_run', () => Int) id_run: number,
    @Arg('id_taxi', () => Int) id_taxi: number
  ):Promise<RunsResponse>{
    try {
      const result = await TaxiRepo.getTaxiById(id_taxi);
  
      if(result!.score <= 4){
          return {
            errors: "Your score is equal or less than 4"
          }
      }

      await RunRepo.setRunToTaxi(id_run, result!);

      const response = await TaxiRepo.updateStatus(id_taxi, TaxiStatus.AVAILABLE);
      if(response == false){
        return {
          errors: "Fail in update status than Taxi"
        }
      }

      await RunRepo.updateStatus(id_run, RunStatus.WAITING_TAXI);

      const run = await RunRepo.getRunsById(id_run)
      
      return {
        run:run
      }

    } catch (error) {
      return {
        errors:"Somethin bad happened"
      }
    }
  }

    /* ------------------------------------------ TAXI FOUND CLIENT ---------------------------------------------- */

  @Mutation(() => RunsResponse)
  async taxiFoundClient(
    @Arg('id_run', () => Int) id_run: number,
    //@Arg('id_taxi', () => Int) id_taxi: number
  ):Promise<RunsResponse>{
    try {

      await RunRepo.updateStatus(id_run, RunStatus.OPEN);
      
      return {
        ret: "true"
      }

    } catch (error) {
      return {
        errors: "Somethin bad happened"
      }
    }
  }

  /* ------------------------------------------ TAXI ARRIVED DESTINATION ---------------------------------------------- */
  @Mutation(() => RunsResponse)
  async taxiArrivedDestination(
    @Arg('id_run', () => Int) id_run: number,
    @Arg('id_taxi', () => Int) id_taxi: number
  ):Promise<RunsResponse>{
    try {

      const response = await TaxiRepo.updateStatus(id_taxi, TaxiStatus.AVAILABLE);
      if(response == false){
        return {
          errors: "Fail in update status than Taxi"
        }
      }

      await RunRepo.updateStatus(id_run, RunStatus.CLOSED);
      
      return {
        ret: "true"
      }

    } catch (error) {
      return {
        errors: "Somethin bad happened"
      }
    }
  }

  /* ------------------------------------------ CANCEL RUN ---------------------------------------------- */

  @Mutation(() => RunsResponse)
  async runCancel(
    @Arg('id_run', () => Int) id_run: number
  ):Promise<RunsResponse>{
    try {

      const result = await RunRepo.getRunsById(id_run);

      if(result?.runStatus != RunStatus.PENDING){
        return {
          errors: "Operation Not Valid"
        }
      }

      await RunRepo.updateStatus(id_run, RunStatus.CANCELED);
      
      return {
        ret: "true"
      }

    } catch (error) {
      return {
        errors: "Somethin bad happened"
      }
    }
  }

  /* ------------------------------------ RUNS SET TO PAID BY SYSTEM -----------------------------------------*/

  @Mutation(() => String)
  async setRunsSystemPaid(
    @Arg('id_taxi', () => Int) id_taxi: number
  ){
    try {

      const taxi = await TaxiRepo.getTaxiById(id_taxi);

      //if(result?.runStatus != RunStatus.PENDING){
     //   return "Operation Not Valid"
     // }

     const runs = await RunRepo.getRunsByTaxi(taxi!);

     for(let cont = 0; cont < runs.length; cont++){
       //if(runs[cont].runPaymentStatus = RunPaymentStatus.PAID){
        console.log(runs[cont].id);
        await RunRepo.setRunToPaidSystem(runs[cont].id);
       //}
     }
      
      return "true"

    } catch (error) {
      return {
        message:"Somethin bad happened"
      }
    }
  }

  /* ------------------------------------ RUN SET TO PAID BY SYSTEM -----------------------------------------*/

  @Mutation(() => String)
  async setRunSystemPaid(
    @Arg('id_run', () => Int) id_run: number
  ){
    try {

      const result = await RunRepo.getRunsById(id_run);

      if(result?.runStatus != RunStatus.PENDING){
        return "Operation Not Valid"
      }

      await RunRepo.setRunToPaidSystem(id_run);
      
      return "true"

    } catch (error) {
      return {
        message:"Somethin bad happened"
      }
    }
  }

  /* ------------------------------------------ GET RUNS BY TAXI AND PAYMENT ------------------------------------- */

  @Query(() => RunsResponse)
  async getRunsByTaxiAndPayment(
      @Arg('id_taxi', () => Int) id_taxi: number
  ):Promise<RunsResponse>{
    try{

      const taxi = await TaxiRepo.getTaxiById(id_taxi);

      const run = await RunRepo.getRunsByTaxiAndPayments(taxi!);

      return{
        runs:run
      }

    }catch(error){
       return {
         errors: "Somethin bad happened"
       }
    }
  }

  /* ------------------------------------------ GET RUN BY ID ---------------------------------------------- */

  @Query(() => RunsResponse)
  async getRunsById(
      @Arg('id_run', () => Int) id_run: number
  ):Promise<RunsResponse>{
    try{

      const run = await RunRepo.getRunsById(id_run);

      return{
        run:run
      }

    }catch(error){
       return {
         errors: "Somethin bad happened"
       }
    }
  }

    /* ------------------------------------------ GET RUNS BY CLIENT ---------------------------------------------- */

  @Query(() => RunsResponse)
  async consultHistory(
      @Arg('id_client', () => Int) id_client: number
  ): Promise<RunsResponse>{
    try{

      const runs = await RunRepo.getRunsByClient(id_client);
      return{
        runs: runs
      }

    }catch(error){
       return {
         errors: "Somethin bad happened"
       }
    }
  }

  /* ------------------------------------------ VERIFY RUN IS ACTIVE ---------------------------------------------- */

  @Query(() => Boolean || String)
  async getRunIsActive(
      @Arg('id_run', () => Int) id_run: number
  ){
    try{

      const run = await RunRepo.getRunsById(id_run);

      if(run?.runStatus == RunStatus.OPEN){
        return true;
      }

      return false;

    }catch(error){
       return {
         errors: "Somethin bad happened"
       }
    }
  }

    /* ------------------------------------------ VERIFY RUN IS ACCEPT ---------------------------------------------- */

  @Query(() => Boolean || String)
  async getRunIsAccept(
      @Arg('id_run', () => Int) id_run: number
  ){
    try{

      const run = await RunRepo.getRunsById(id_run);

      if(run?.runStatus == RunStatus.WAITING_TAXI){
        return true;
      }

      return false;

    }catch(error){
       return {
         errors: "Somethin bad happened"
       }
    }
  }

    /* ------------------------------------------ VERIFY RUN OPEN - TAXI ARRIVED ---------------------------------------------- */

  @Query(() => Boolean || String)
  async getRunTaxiIsArrived(
      @Arg('id_run', () => Int) id_run: number
  ){
    try{

      const run = await RunRepo.getRunsById(id_run);

      if(run?.runStatus == RunStatus.OPEN){
        return true;
      }

      return false;

    }catch(error){
       return {
         errors: "Somethin bad happened"
       }
    }
  }

    /* ------------------------------------------ VERIFY RUN IS OVER ---------------------------------------------- */

  @Query(() => Boolean || String)
  async getRunIsOver(
      @Arg('id_run', () => Int) id_run: number
  ){
    try{

      const runs = await RunRepo.getRunsById(id_run);
      
      if(runs!.runStatus == RunStatus.CLOSED){
        return true;
      }

      return false;

    }catch(error){
       return {
         errors: "Somethin bad happened"
       }
    }
  }
  
    /* ------------------------------------------ GET RUNS IS WAITING ---------------------------------------------- */

  @Query(() => RunsResponse)
  async getRunsWaiting(
      @Arg('id_taxi', () => Int) id_taxi: number
  ): Promise<RunsResponse>{
    try{
        
        const taxi = await TaxiRepo.getTaxiById(id_taxi);

        if(taxi!.score <= 4){
          console.log("Nota menor que 4");
            return{
                errors: "Your Score Is Less Than 4"   
            }
        }
        console.log("Passou");
        const runs = await RunRepo.getRunsByStatus(RunStatus.PENDING);
        return{
          runs: runs
        }

    }catch(error){
       return {
         errors: "Somethin bad happened"
       }
    }
  }

    /* ------------------------------------------ GET RUN STATE ---------------------------------------------- */

  @Query(() => Int || String)
  async getRunState(
      @Arg('id_run', () => Int) id_run: number
  ){
    try{

      const run = await RunRepo.getRunsById(id_run);

      return run?.runStatus;
    
    }catch(error){
       return {
         errors: "Somethin bad happened"
       }
    }
  }

  @Query(() => RunsResponse)
  async getRuns(
  ):Promise<RunsResponse>{
    try{

      const runs = await RunRepo.getRuns();
      return{
        runs: runs
      };
    
    }catch(error){
       return{
         errors:"Something bad hapenned"
       }
    }
  }

  @Query(()=> RunsResponse)
    async getRunPaymentYield(
        @Arg('data_initial', ()=> String) data_initial: string,
        @Arg('data_final', ()=> String) data_final: string
    ):Promise<RunsResponse>{
        try{
            const result = await RunRepo.getRunPaymentYield(data_initial, data_final);

            for(let cont = 0; cont < result.length; cont++){
              const taxi = await TaxiRepo.getTaxiById(result[cont].taxiId);
              if(taxi == null){
                let taxi = new Taxi;
                taxi.id = -1;
                result[cont].taxi = taxi;
              }else{
                result[cont].taxi = taxi;
              }
          }

            return{
                runs: result
            }
        }catch(error){
            return{
                errors: error
            }
        }
    }

    @Query(()=> RunsResponse)
    async getRunPaymentYieldTaxiID(
        @Arg('data_initial', ()=> String) data_initial: string,
        @Arg('data_final', ()=> String) data_final: string,
        @Arg('id_taxi', ()=> Int) id_taxi: number
    ):Promise<RunsResponse>{
        try{
            const result = await RunRepo.getRunPaymentYieldTaxiID(data_initial, data_final, id_taxi);
            return{
                runs: result
            }
        }catch(error){
            return{
                errors: error
            }
        }
    }

    @Query(()=> RunsResponse)
    async getRunByPaymentSystem(
    ):Promise<RunsResponse>{
        try{
            const result = await RunRepo.getRunByPaymentSystem();
            for(let cont = 0; cont < result.length; cont++){
              let taxi = new Taxi;
              if(result[cont].taxi == null){
                console.log("Entrou");
                taxi.id = -2;
                result[cont].taxi = taxi;
              }else{
              }
          }
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