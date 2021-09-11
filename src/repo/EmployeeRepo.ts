import { Area, Employee } from "../entity/Employee";
import { getConnection } from "typeorm";
import argon2 from 'argon2'

class EmployeeRepo {

  // Seatch clients by email (email is a unique key), if there is more than one
  // client with the same email, returns false
  async getEmployeeByEmail(email: String): Promise<Employee|Boolean>{
    const employee = await Employee.find({where:{email: email}})
    if (employee.length >= 2) {
      return false
    }
    return employee[0]
  } 
  
  // Seatch clients by cpf (cpf is a unique key), if there is more than one
  // client with the same cpf, returns false
  async getEmployeeByCpf(cpf: String): Promise<Employee|Boolean>{
    const employee = await Employee.find({where:{cpf: cpf}})
    if (employee.length >= 2) {
      return false
    }
    return employee[0]
  }

  async getEmployeeById(id: number) {
    const employee = await Employee.findOne({where:{id:id}})
    return employee
  }

  async updateEmployee(
    id_employee: number,
    email: string,
    phone: string,
    nickName: string,
    area_situation: Area,
    password: string,
    name: string
  ): Promise<Employee | Boolean>{
    try {
      if(password == "" || password == null){
        await getConnection()
        .createQueryBuilder()
        .update(Employee)
        .set({
          email: email,
          phone: phone,
          nickName: nickName,
          area_atuation: area_situation,
          name: name
        })
        .where("id = :id", { id: id_employee })
        .execute()
      }else{
        if(password == "" || password == null){
          await getConnection()
          .createQueryBuilder()
          .update(Employee)
          .set({
            email: email,
            phone: phone,
            nickName: nickName,
            name:name,
            area_atuation: area_situation,
            hashed_password: await argon2.hash(password)
          })
          .where("id = :id", { id: id_employee })
          .execute()
        }
      } 

      return true
    } catch (error) {
      console.log(error);
      return false
    }
  }

  async deleteEmployee(
    id_employee: number,
  ): Promise<Employee | Boolean>{
    try {
      await Employee.delete(id_employee);
      return true
    } catch (error) {
      return false
    }
  }

  async disableEmployee(
    id_employee: number,
  ): Promise<Employee | Boolean>{
    try {
      await getConnection()
      .createQueryBuilder()
      .update(Employee)
      .set({
        active: false
      })
      .where("id = :id", { id: id_employee })
      .execute()

      return true
    } catch (error) {
      return false
    }
  }

  async findEmployeeByCpfOrEmail(cpfOrEmail: String){

    const client = await Employee.findOne(
      cpfOrEmail.includes('@')
      ? {where: {email: cpfOrEmail}}
      : {where: {cpf: cpfOrEmail}}
    )

    return client
  }

}

export default new EmployeeRepo()