import StatCard from "./StatCard";

type Transaction = {
  amount: string;
  returnAmount: string;
  people:any []
};

type Props = {
  transactions: Transaction[];
};


export default function Overview({ transactions }:Props) {


  const totalSpent = transactions.reduce((sum: number, t: { amount: string; }) => sum + parseFloat(t.amount), 0);
  const returns = transactions.reduce((sum: number, t: { returnAmount: string; }) => sum + parseFloat(t.returnAmount), 0);


  const noreturns = transactions
    .filter((t: { people: any[]; }) => t.people?.find(p => p.name === "N"))
    .reduce((sum: number, t: { returnAmount: string; }) => sum + (parseFloat(t.returnAmount) || 0), 0);

  const totalBalance = totalSpent - returns;

  const format = (num: number) =>
    `₹${num.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    return (
      <div className="grid grid-cols-3 gap-6 mb-10 p-10">
        <StatCard 
          title="TOTAL SPEND" 
          value={format(totalSpent??500)} 
        />

        <StatCard 
          title="SPEND" 
          value={format(totalBalance??100)} 
        />
        
        <StatCard 
          title="RETURNS" 
          value={format(returns??200)} 
          change={format(returns -noreturns)} 
        />
      </div>
    );
}