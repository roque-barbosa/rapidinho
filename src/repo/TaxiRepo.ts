
import { Taxi, TaxiStatus } from "../entity/Taxi";
import { SexType, UserType } from "../entity/User";
import { getConnection } from "typeorm";
import argon2 from 'argon2'

class TaxiRepo{
  async CreateTaxi(
    name: string,
    email: string,
    password: string,
    cpf: string,
    cnh: string,
    registrationNumber: string,
    phone: string,
    sex: SexType,
    birthDate: Date,
    nickName: string,
    userType: UserType,
    profilePicLink?: string,
    documentation_link?: string
  ){

    const result = await getConnection()
    .createQueryBuilder()
    .insert()
    .into(Taxi)
    .values({
      name: name,
      email: email,
      hashed_password: await argon2.hash(password),
      cpf: cpf,
      cnh: cnh,
      registrationNumber: registrationNumber,
      phone: phone,
      sex: sex,
      profilePicLink: profilePicLink,
      birthDate: birthDate,
      nickName: nickName,
      userType: userType,
      documentation_link: documentation_link
    })
    .execute()

    const taxi = Taxi.findOne({where:{id:result.raw.insertId}})
    return taxi
  }

  async updateStatus(id_taxi: number, status: TaxiStatus){
    try{  
      await getConnection().createQueryBuilder().update(Taxi)
      .set({
        status: status
      })
      .where("id = :id", { id: id_taxi })
      .execute()
    
    return true
  }catch(error){
      return false;
  }
  
}

  async getTaxiById(id: number){
    const taxi = await Taxi.findOne({where:{id: id}})
    return taxi
  }

  async getTaxiByEmail(email_taxi: string){
      const taxi = await Taxi.findOne({where: {email:email_taxi}});
      return taxi;
  }

  async getTaxiByCPF(cpf_taxi: string){
    const taxi = await Taxi.findOne({where: {cpf:cpf_taxi}});
    return taxi;
  }

  async getAllTaxis(){
    const taxis = await Taxi.find()
    return taxis
  }

  async deleteTaxiById(id: number){
    Taxi.delete(id)
  }

  async updateScore(
    score: number,
    avaliationsQuantity: number,
    id_taxi: number
  ): Promise<Taxi | Boolean>{
    try {
      await getConnection()
      .createQueryBuilder()
      .update(Taxi)
      .set({
        score:score,
        avaliationsQuantity: avaliationsQuantity
      })
      .where("id = :id", { id: id_taxi })
      .execute()

      return true
    } catch (error) {
      return false
    }
  }

  async findTaxiByCpfOrEmail(cpfOrEmail: String){

    const taxi = await Taxi.findOne(
      cpfOrEmail.includes('@')
      ? {where: {email: cpfOrEmail}}
      : {where: {cpf: cpfOrEmail}}
    )

    return taxi
  }

}

export default new TaxiRepo()