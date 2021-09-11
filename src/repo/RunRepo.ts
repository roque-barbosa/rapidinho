import { Taxi } from "../entity/Taxi";
import { Client } from "../entity/Client";
import { Run, RunPaymentStatus, RunPaymentType, RunStatus, RunType } from "../entity/Run";
import { getConnection, getManager } from "typeorm";
import TaxiRepo from "./TaxiRepo";
import ClientRepo from "./ClientRepo";

class RunRepo{
    async createRun(
        clientCordinates: string,
        destinyCordinates: string,
        price: number,
        runType: RunType,
	    runPaymentType: RunPaymentType,
	    id_taxi: number,
	    id_client: number
    ){
        let acceptedAt!: Date;
        let paidAt!:Date;
        let runPaymentStatus!: RunPaymentStatus;
        let runStatus!: RunStatus;

        const taxi = await TaxiRepo.getTaxiById(id_taxi);
        const client = await ClientRepo.getClientById(id_client);

        const result = await getConnection().createQueryBuilder().insert().into(Run).values({
            acceptedAt: acceptedAt,
            paidAt: paidAt,
            clientCordinates: clientCordinates,
            destinyCordinates: destinyCordinates,
            price: price,
            runType: runType,
            runPaymentStatus: runPaymentStatus,
            runStatus: runStatus,
            runPaymentType: runPaymentType,
            taxi: taxi,
            client: client
        }).execute();

        const run = await Run.findOne({where:{id:result.raw.insertId}});
        return run;

    }

    async updateStatus(id_run: number, status: RunStatus){
        await getConnection().createQueryBuilder().update(Run)
        .set({
            runStatus: status
        })
        .where("id = :id", { id: id_run })
        .execute()
    }

    async setRunToTaxi(id_run: number, taxi: Taxi){
        await getConnection().createQueryBuilder().update(Run)
        .set({
            taxi: taxi
        })
        .where("id = :id", { id: id_run })
        .execute()
    }

    async setRunToPaidSystem(id_run: number){
        await getConnection().createQueryBuilder().update(Run)
        .set({
            runSystemPaymentStatus: RunPaymentStatus.PAID
        })
        .where("id = :id", { id: id_run })
        .execute()
    }

    async deleteRun(id: number){
        const runs = await Run.find({where: {id: id}});
        return runs;
    }

    async getRunsByClient(id_client: number){
        let client: Client = new Client();
        client.id = id_client;

        const runs = await Run.find({where: {client: client}});
        return runs;
    }

    async getPaymentRunsOpen(id_client: number){
        let client: Client = new Client();
        client.id = id_client;

        const runs = await Run.find({where: {client: client, runPaymentStatus: 0}});
        return runs;
    }

    async getRunsByActive(id_taxi: number){
        let taxi: Taxi = new Taxi();
        taxi.id = id_taxi;

        const runs = await Run.find({where: {taxi: taxi}});
        return runs;
    }

    async getRunsById(id_run: number){
        const run = await Run.findOne({where: {id: id_run}});
        return run;
    }

    async getRunsByTaxi(taxi: Taxi){
        const run = await Run.find({where: {taxi: taxi}});
        return run;
    }

    async getRunsByStatus(status: number){
        const runs = await Run.find({where: {runStatus: status}});
        return runs;
    }

    async getRunsByTaxiAndPayments(taxi: Taxi){
        const runs = await Run.find({where: {taxi:taxi, runSystemPaymentStatus:0, runPaymentStatus: RunPaymentStatus.PAID}});
        return runs;
    }

    async setRunToPaid(id_client: number){
        let paidAt:Date = new Date();
        try {
            //const client = await ClientRepo.getClientById(id_client)
            //const run = await Run.findOne({where: {runPaymentStatus: 0, client: client}});
            await getConnection()
            .createQueryBuilder()
            .update(Run)
            .set({
                paidAt: paidAt,
                runPaymentStatus: 1
            })
            .where("id = :id", { id: id_client })
            .execute()
            return true
            
        } catch (error) {
            console.log(error);
            return false
        }
    }

    async getRuns(){
        const runs = await Run.find();
        return runs;
    }

    async getRunPaymentYield(data_initial: string, data_final: string){
        //const payments = await getConnection().createQueryBuilder().select().from(Payment, "payment").where("payment.createdAt data_initial BETWEEN  AND data_final;", {data_initial, data_final});
        const entityManager = getManager();
        console.log(data_initial + " " + data_final);
        const someQuery = entityManager.query(`
            SELECT * FROM run where paidAt BETWEEN date(?) AND date(?);
  `, [data_initial, data_final]);
  
        return someQuery;
    }

    async getRunPaymentYieldTaxiID(data_initial: string, data_final: string, id_taxi:number){
        //const payments = await getConnection().createQueryBuilder().select().from(Payment, "payment").where("payment.createdAt data_initial BETWEEN  AND data_final;", {data_initial, data_final});
        const entityManager = getManager();
        console.log(data_initial + " " + data_final);
        const someQuery = entityManager.query(`
            SELECT * FROM run where taxiId = ? and paidAt BETWEEN date(?) AND date(?);
  `, [id_taxi, data_initial, data_final]);
  
        return someQuery;
    }

    async getRunByPaymentSystem(){
        const runs = await Run.find({where:{runSystemPaymentStatus: 0}});
        return runs;
    }

}

export default new RunRepo()