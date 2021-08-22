import { AvaliationTaxi } from "../entity/AvaliationTaxi";
import { getConnection } from "typeorm";
import ClientRepo from "./ClientRepo";
import TaxiRepo from "./TaxiRepo";
import { Float } from "aws-sdk/clients/ec2";

class AvaliationTaxiRepo{
    async createAvaliationTaxi(score: number, comment: string, id_client: number, id_taxi: number){
        const client = await ClientRepo.getClientById(id_client);
        const taxi = await TaxiRepo.getTaxiById(id_taxi);

        let quantA: number = taxi!.avaliationsQuantity;
        quantA = quantA+1;
        let sc!: Float;
        sc = taxi!.score;
        // sc = ((sc*2)*(score*0.5))/4;
        sc = ( (sc * 95) + (score * 5) )/100

        if(sc > 5){
            sc = 5;
        }
        console.log(sc);

        await TaxiRepo.updateScore(sc, quantA, id_taxi);

        const result = await getConnection().createQueryBuilder().insert().into(AvaliationTaxi).values({
            score: score,
            comment: comment,
            taxi: taxi,
            client: client
        }).execute();

        const avaliationTaxi = await AvaliationTaxi.findOne({where:{id:result.raw.insertId}});
        return avaliationTaxi;
    }

    async getAllAvatiationTaxi(id_taxi: number){
        const taxi = await TaxiRepo.getTaxiById(id_taxi);
        const avaliationTaxi = await AvaliationTaxi.find({where:{taxi: taxi}});
        return avaliationTaxi;
    }

    async getAllAvatiationTaxiById(id_avaliationTaxi: number){
        const avaliationTaxi = await AvaliationTaxi.findOne({where:{id: id_avaliationTaxi}});
        return avaliationTaxi;
    }
}

export default new AvaliationTaxiRepo();