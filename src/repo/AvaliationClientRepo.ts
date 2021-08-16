import { AvaliationClient } from "../entity/AvaliationClient";
import { getConnection } from "typeorm";
import ClientRepo from "./ClientRepo";
import TaxiRepo from "./TaxiRepo";

class AvaliationClientRepo{//Taxi avalia o cliente
    async createAvaliationClient(score: number, comment: string, id_client: number, id_taxi: number){
        const client = await ClientRepo.getClientById(id_client);
        const taxi = await TaxiRepo.getTaxiById(id_taxi);

        let quantA = client!.avaliationsQuantity;
        quantA = quantA+1;
        
        let sc = client!.score;
        sc = (sc+score)/quantA;

        if(sc > 5){
            sc = 5;
        }

        await ClientRepo.updateScore(sc, quantA, id_client);

        const result = await getConnection().createQueryBuilder().insert().into(AvaliationClient).values({
            score: score,
            comment: comment,
            taxi: taxi,
            client: client
        }).execute();

        const avaliationClient = await AvaliationClient.findOne({where:{id:result.raw.insertId}});
        return avaliationClient;
    }

    async getAllAvatiationClient(id_client: number){
        const client = await ClientRepo.getClientById(id_client);
        const avaliationClient = await AvaliationClient.find({where:{taxi: client}});
        return avaliationClient;
    }

    async getAllAvatiationClientById(id_avaliationClient: number){
        const avaliationClient = await AvaliationClient.findOne({where:{id: id_avaliationClient}});
        return avaliationClient;
    }
}

export default new AvaliationClientRepo();