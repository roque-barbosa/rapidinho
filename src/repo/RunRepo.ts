import { Taxi } from "../entity/Taxi";
import { Client } from "../entity/Client";
import { Run, RunPaymentStatus, RunPaymentType, RunStatus, RunType } from "../entity/Run";
import { getConnection } from "typeorm";
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
        let runPaymentStatus!: RunPaymentStatus;
        let runStatus!: RunStatus;

        const taxi = await TaxiRepo.getTaxiById(id_taxi);
        const client = await ClientRepo.getClientById(id_client);

        const result = await getConnection().createQueryBuilder().insert().into(Run).values({
            acceptedAt: acceptedAt,
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

    async getRunsByStatus(status: number){
        const runs = await Run.find({where: {runStatus: status}});
        return runs;
    }

}

export default new RunRepo()