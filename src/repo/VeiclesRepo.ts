import { Taxi } from "../entity/Taxi";
import { Veicle } from "../entity/Veicle";

class VeiclesRepo{
    async deleteVeicle(){

    }

    async getVeiclesByTaxi(id_taxi: number){
        let taxi : Taxi = new Taxi();
        taxi.id = id_taxi;
        const veicles = await Veicle.find({where: {taxi: taxi}});
        return veicles;
    }

    async getVeicleById(id_veicle: number){
        const veicles = await Veicle.findOne({where: {id: id_veicle}});
        return veicles;
    }

    
}

export default new VeiclesRepo();