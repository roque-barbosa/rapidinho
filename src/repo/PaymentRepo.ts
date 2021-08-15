import { Payment } from "../entity/Payment";
import { getConnection } from "typeorm";
import ClientRepo from "./ClientRepo";

class PaymentRepo{
    async createPayment(price: number, id_client: number){
        const client = await ClientRepo.getClientById(id_client);
        const result = await getConnection().createQueryBuilder().insert().into(Payment).values({
            price: price,
            client: client
        }).execute();

        const payment = await Payment.findOne({where:{id:result.raw.insertId}});
        return payment;
    }
}

export default new PaymentRepo();