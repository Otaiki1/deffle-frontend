import Landing from "../components/Landing";

import { useState, useEffect } from "react";
import EventCard from "../components/EventCard";
import connectContract from "../utils/connectContract";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

const queryContractForData = async() => {
  const deffleContract = connectContract();
  const outputObj = []
  if(deffleContract){

    let allCurrentIds = await deffleContract.getIdList();
    allCurrentIds = allCurrentIds.map(id => id.toString())
    for(let i = 0; i < allCurrentIds.length; i++){
      const isOnline = await deffleContract.getDeadline(allCurrentIds[i]);
      if(isOnline){
        const tempObj = {
          "id": i,
         "name": "Raffle #"+i,
          "timestamp" : isOnline,
          "imageUrl": "",
          "fee": (await deffleContract.getEntranceFee(i)).toString(),
        }
        outputObj.push(tempObj);
      }
    }
  }
  return outputObj
}

export default function Home() {

  const { data: account } = useAccount();

  const[activeGames, setActiveGames] = useState([]);
  const[loading, setLoading] = useState(true);
  const[noGames, setNoGames] = useState(false);``
  
  useEffect(async() => {

    const games  = await queryContractForData()
    if(games){
      setLoading(false);
      setActiveGames(games)
      setNoGames(false)
    }else{
      setLoading(false);
      setNoGames(true)
      setActiveGames([])
    }
  }, [])

if (loading && account)
  return (
    <Landing>
      <p>Loading...</p>
    </Landing>
  );
if (noGames && account)
  return (
    <Landing>
      <p>`No ACTIVE GAMES`</p>
    </Landing>
  );
  
   if( account ) return (
      <Landing>
      <ul
        role="list"
        className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8"
      >
        {activeGames&&
          activeGames.map((game) => (
            <li key={game.id}>
              <EventCard
                id={game.id}
                name={game.name}
                eventTimestamp={game.timestamp}
                imageURL={game.imageURL}
                fee={game.fee}
                link={`/event/${game.id}`}
              />
            </li>
          ))}
      </ul>
    </Landing>
    )
  
return (

  <section className="flex flex-col items-start py-8">
  <p className="mb-4">Please connect your wallet to create Raffles.</p>
  <ConnectButton />
</section>
);
}

