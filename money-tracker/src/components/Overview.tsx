import StatCard from "./StatCard";



export default function Overview({ transactions }) {

const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);

// console.log(t);


const returns = transactions.reduce((sum, t) => sum + t.returnAmount, 0);


const noreturns = transactions
  .filter(t => t.people?.find(p => p.name === "N"))
  .reduce((sum, t) => sum + (t.returnAmount || 0), 0);

const totalBalance = totalSpent - returns;

const format = (num: number) =>
  `₹${num.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  return (
    <div className="grid grid-cols-3 gap-6 mb-10 p-10">
      <StatCard 
        title="TOTAL SPEND" 
        value={format(totalSpent)} 
      />

      <StatCard 
        title="SPEND" 
        value={format(totalBalance)} 
      />
       
      
      <StatCard 
        title="RETURNS" 
        value={format(returns)} 
        change={format(returns -noreturns)} 
      />
    </div>
  );
}