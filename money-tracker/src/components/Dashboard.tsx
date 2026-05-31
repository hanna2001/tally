import Overview from "./Overview";
import Collections from "./Collections";
import Recents from "./Recents";

import { useEffect,useState } from "react";
import { getTransactionAmount} from "../services/transactionService"


export default function DashBoard() {
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
  return (
    <>
        <Overview transactions={[]} data={transactionData} label2={'OWED BY YOU'}  label3="OWES TO YOU"/>
        <Recents/>
        <Collections/>
    </>
    
  );
}