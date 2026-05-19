import { useState,useEffect } from "react";

import { listSheets,createSheet } from "../services/sheetService"; 
import CollectionCard from "./CollectionCard";
import CreateCard from "./CreateCard";


export default function Recents() {
  type Sheet = {
  name: string;
};

  const [sheets,setSheets] = useState([])

  async function fetchData() {
    try {
      const res = await listSheets();
      setSheets(res.sheets)
    }catch (error) {
      console.log(error)
    }
  }

  const handleCreateSheet = async () => {
    await createSheet("mayff");
    fetchData();
  };

  useEffect((()=>{
      fetchData();
  }),[])

  return (
    <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500&family=DM+Mono:wght@500&display=swap');
          * { box-sizing: border-box; }
        `}</style>

        <div style={{
          background: "#f7f2ec",
          padding: "48px 40px",
          fontFamily: "'DM Sans', sans-serif",
        }}>

        <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "36px",
          }}>
          <div>
            <h1 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "34px",
              fontWeight: 700,
              color: "#1a1714",
              margin: "0 0 6px",
              letterSpacing: "-0.02em",
            }}>
               Recents
            </h1>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "14px",
              color: "#9a8f85",
              margin: 0,
            }}>
              Curated ledgers for your specific lifestyle goals.
            </p>
          </div>

          
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: "20px",
        }}>
          {sheets.map((sheet:Sheet) => (
            <CollectionCard key={sheet.name} sheet={sheet} />
          ))}
          <CreateCard onCreate={handleCreateSheet}/>
        </div>
        
      </div>
      
    </>
  );
}