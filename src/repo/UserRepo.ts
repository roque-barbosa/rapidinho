import { Client } from "../entity/Client";
import { Taxi } from "../entity/Taxi";

class UserRepo{
    async deleteUser(){

    }

    async login(login: string, password: string){
        const loginClient = await Client.findOne({where: {email: login, hashed_password: password}});
      if(loginClient != null){
        console.log("Fez Login Client Com Email");
        return{
            user: loginClient
        }
      }
      console.log("Parte 01");
      const loginClientCPF = await Client.findOne({where: {cpf: login, hashed_password: password}});
      if(loginClientCPF != null){
        console.log("Fez Login Client Com CPF");
          return{
              user: loginClientCPF
          }
      }
      console.log("Parte 02");
      const loginTaxi = await Taxi.findOne({where: {email: login, hashed_password: password}});
      if(loginTaxi != null){
        console.log("Fez Login Taxi Com Email");
        return{
            user: loginTaxi
        }
      }

      console.log("Parte 03");
      const loginTaxiCPF = await Taxi.findOne({where: {cpf: login, hashed_password: password}});
      if(loginTaxiCPF != null){
          console.log("Fez Login Taxi Com CPF");
          return{
              user: loginTaxiCPF
          }
      }
      console.log("Parte 04");
      return{
        ret: "Incorrect Login"
      }
    }

}
export default new UserRepo();