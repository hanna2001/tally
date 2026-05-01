import StatCard from "./StatCard";



export default function PaymentMethodOverview({ transactions }) {

const tata = transactions.filter(p => p.method === "Card - Tata Neu").reduce((sum, t) => sum + t.amount, 0);

const moneyback = transactions.filter(p => p.method === "Card - Moneyback").reduce((sum, t) => sum + t.amount, 0);

const pluxee = transactions.filter(p => p.method === "Pluxee").reduce((sum, t) => sum + t.amount, 0);



const format = (num: number) =>
  `₹${num.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  return (
    <div className="grid grid-cols-3 gap-6 mb-10 p-10">
      <StatCard 
        title="Tata" 
        value={format(tata)} 
      />
      <StatCard 
        title="Money Back" 
        value={format(moneyback)} 
      />
      <StatCard 
        title="Pluxee" 
        value={format(pluxee)} 
      />
    </div>
  );
}