import { retrieveTransaction } from "../../utils/omiseUtils";

export const updateTransaction = async (tran) => {
  const data = await retrieveTransaction(tran.tranId);
  if (data && data.sent && data.paid) {
    tran.status = data.sent;
    return await tran.save();
  }
};
