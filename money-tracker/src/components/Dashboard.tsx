import Overview from "./Overview";
import Collections from "./Collections";
import Recents from "./Recents";

export default function DashBoard() {

  return (
    <>
        <Overview transactions={[]} label2={'OWED BY YOU'}  label3="OWES TO YOU"/>
        <Recents/>
        <Collections/>
    </>
    
  );
}