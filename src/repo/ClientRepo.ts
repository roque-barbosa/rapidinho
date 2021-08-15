import { SexType, UserType } from "../entity/User";
import { Client } from "../entity/Client";
import { getConnection } from "typeorm";

class ClientRepo {

  // Seatch clients by email (email is a unique key), if there is more than one
  // client with the same email, returns false
  async getClientByEmail(email: String): Promise<Client|Boolean>{
    const client = await Client.find({where:{email: email}})
    if (client.length >= 2) {
      return false
    }
    return client[0]
  } 
  
  // Seatch clients by cpf (cpf is a unique key), if there is more than one
  // client with the same cpf, returns false
  async getClientByCpf(cpf: String): Promise<Client|Boolean>{
    const client = await Client.find({where:{cpf: cpf}})
    if (client.length >= 2) {
      return false
    }
    return client[0]
  }

  async getClientById(id: number) {
    const client = await Client.findOne({where:{id:id}})
    return client
  }

  async updateClient(
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
  ): Promise<Client | Boolean>{
    try {
      await getConnection()
      .createQueryBuilder()
      .update(Client)
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

    const client = await Client.findOne(
      cpfOrEmail.includes('@')
      ? {where: {email: cpfOrEmail}}
      : {where: {cpf: cpfOrEmail}}
    )

    return client
  }
}

export default new ClientRepo()