import StatCard from "./StatCard";
import { useEffect,useState} from "react";
import { getTransactionAmount} from "../services/transactionService"


export default function Overview({ transactions,data=null,label1='TOTAL SPEND',label2='SPEND',label3='RETURNS'}) {

 const [transactionData,setTransactionData] = useState({})
 async function fetchData() {
      try {
        const res = await getTransactionAmount();
        setTransactionData(res)
      }catch (error) {
        console.log(error)
      }
    }
  useEffect(() => {
    fetchData()
  }, []);
  
  let totalSpent = transactions.reduce((sum: number, t: { amount: string; }) => sum + parseFloat(t.amount), 0);
  let returns = transactions.reduce((sum: number, t: { returnAmount: string; }) => sum + parseFloat(t.returnAmount), 0);
  let totalBalance = totalSpent - returns;

  if (transactionData){
    totalSpent = transactionData?.total_amount;
    returns =transactionData?.owed_amount;
    totalBalance = transactionData?.owes_amount;
  }


  const noreturns = transactions
    .filter((t: { people: any[]; }) => t.people?.find(p => p.name === "N"))
    .reduce((sum: number, t: { returnAmount: string; }) => sum + (parseFloat(t.returnAmount) || 0), 0);

  

  const format = (num: number) =>
    `₹${num.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    return (
      <div className="grid grid-cols-3 gap-6 mb-10 p-10">
        <StatCard 
          title={label1} 
          value={format(totalSpent??500)} 
        />

        <StatCard 
          title={label2}
          value={format(totalBalance??100)} 
        />
        
        <StatCard 
          title={label3}
          value={format(returns??200)} 
          change={format(returns -noreturns)} 
        />
      </div>
    );
}