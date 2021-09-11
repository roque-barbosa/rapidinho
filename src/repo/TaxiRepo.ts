
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
    profilePicLink: string,
    birthDate: Date,
    nickName: string,
    userType: UserType,
    docmentaion_link: string
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
      docmentaion_link: docmentaion_link
    })
    .execute()

    const taxi = Taxi.findOne({where:{id:result.raw.insertId}})
    return taxi
  }

  async updateTaxi(
    id_client: number,
    name: string,
    email: string,
    cpf: string,
    phone: string,
    sex: SexType,
    profilePicLink: string,
    birthDate: Date,
    nickName: string,
    userType: UserType
  ): Promise<Taxi | Boolean>{
    try {
      await getConnection()
      .createQueryBuilder()
      .update(Taxi)
      .set({
        name: name,
        email: email,
        cpf: cpf,
        phone: phone,
        sex: sex,
        profilePicLink: profilePicLink,
        birthDate: birthDate,
        nickName: nickName,
        userType: userType
      })
      .where("id = :id", { id: id_client })
      .execute()

      return true
    } catch (error) {
      return false
    }
  }

  async findClientByCpfOrEmail(cpfOrEmail: String){

    const taxi = await Taxi.findOne(
      cpfOrEmail.includes('@')
      ? {where: {email: cpfOrEmail}}
      : {where: {cpf: cpfOrEmail}}
    )

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
      const taxi = await Taxi.find({where: {email:email_taxi}});
      return taxi;
  }

  async getTaxiByCPF(cpf_taxi: string){//Alteracao
    const taxi = await Taxi.find({where: {cpf:cpf_taxi}});
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

  async getTaxiByStatus(status: number){//Alteracao
    const taxi = await Taxi.find({where: {status:status}});
    return taxi;
  }

  async updateTaxiForEmployee(id_taxi: number, email: string, password: string, name: string, nickName: string,){
    try{  

      const r = await Taxi.find({where: {email: email}});
      for(let cont = 0; cont < r.length; cont++){
        if((r[cont].email == email) && (r[cont].id != id_taxi)){
          return -1;
        }
      }

      const n = await Taxi.find({where: {nickName: nickName}});
      for(let cont = 0; cont < n.length; cont++){
        if((n[cont].nickName == nickName) && (n[cont].id != id_taxi)){
          return -2;
        }
      }
      if(password == "" || password == null){
        await getConnection().createQueryBuilder().update(Taxi)
        .set({
          email: email,
          name: name,
          nickName: nickName
        })
        .where("id = :id", { id: id_taxi })
        .execute()
      }else{
        await getConnection().createQueryBuilder().update(Taxi)
        .set({
          email: email,
          hashed_password: await argon2.hash(password),
          name: name,
          nickName: nickName
        })
        .where("id = :id", { id: id_taxi })
        .execute()
      }
      
    
    return 1
  }catch(error){
      return 0;
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