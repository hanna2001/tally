import Overview from "./Overview";
import Collections from "./Collections";
import Recents from "./Recents";

import { useEffect } from "react";


export default function DashBoard() {


  useEffect(() => {

}, []);
  return (
    <>
        <Overview transactions={[]} />
        <Recents/>
        <Collections/>
    </>
    
  );
}