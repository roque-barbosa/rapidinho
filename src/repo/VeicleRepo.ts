import { Taxi } from "../entity/Taxi";
import { Veicle, VeicleColor, VeicleType } from "../entity/Veicle";
import { getConnection } from "typeorm";

class VeicleRepo{
  async createVeicle(
    plauqe: string,
    taxi: Taxi,
    model: string,
    veicleColor: VeicleColor,
    veicleType: VeicleType,
    crvVeicleLink: string
  ){
    const result = await getConnection()
    .createQueryBuilder()
    .insert()
    .into(Veicle)
    .values({
      licensePlate: plauqe,
      taxi: taxi,
      model: model,
      color: veicleColor,
      veicleType: veicleType,
      crvLink: crvVeicleLink
    })
    .execute()

    let veicle = await Veicle.findOne({where: {id: result.raw.insertId}})
    return veicle
  }
  async getVeicleById(id_veicle: number){
    const veicle = Veicle.findOne({where:{id:id_veicle}})
    return veicle
  }
}
export default new VeicleRepo()