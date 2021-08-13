
import { Taxi } from "../entity/Taxi";
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
}

export default new TaxiRepo()