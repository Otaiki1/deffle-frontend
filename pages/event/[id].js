import Head from "next/head";
import formatTimestamp from "../../utils/formatTimestamp";

import {
  EmojiHappyIcon,
  TicketIcon,
  UsersIcon,
  LinkIcon
} from "@heroicons/react/outline";

import { ethers } from "ethers";
import{useState, useEffect} from "react"

import connectContract from "../../utils/connectContract";

import { ConnectButton} from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import Alert from "../../components/Alert";

const toEther = (str) => ethers.utils.parseEther(str);
const fromEther = (eth) => ethers.utils.formatEther(eth);
const toBytes = (str) => ethers.utils.formatBytes32String(str);



// async function retrieveFiles (cid) {
  
// const bufferedContents = await (ipfs.cat('QmWCscor6qWPdx53zEQmZvQvuWQYxx1ARRCXwYVE4s9wzJ')) // returns a Buffer
// const stringContents = bufferedContents.toString() // returns a string

// console.log(stringContents)
// }

function retrieveIpfsData(cid){

}

function Event({data}) {

  const { data: account } = useAccount();
  const [success, setSuccess] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(null);


  const[deadline, setDeadline] = useState("")
  const[participants, setParticipants] = useState("")
  const[ownerAddress, setOwnerAddress] = useState("")
  const[entryFee, setEntryFee] = useState("")
  const [currentTimestamp, setEventTimestamp] = useState(new Date().getTime());
  const[passcode, setPasscode] = useState("");

  const deffle = connectContract();
  console.log("data is ", data)

  const fetchDetails  = async(__data) => {
    let _data = {}
    let _id = __data
    if(deffle){
      _data  =  {
                  "id": __data,
                  "raffleData": await deffle.getRaffleData(_id),
                  "entranceFee":(await deffle.getEntranceFee(_id)).toString(),
                  "deadline":(await deffle.getDeadline(_id)).toString(),
                  "maxTickets":await deffle.getMaxPlayers(_id),
                  "participants":await deffle.getPlayers(_id),
                  "owner":await deffle.getRaffleOwner(_id),
                  "raffleState":await deffle.getRaffleState(_id),
                  "raffleBalance":await deffle.getRaffleBalance(_id).toString(),
                  "raffleWinner":await deffle.getRaffleWinner(_id),
          }
        setDeadline(_data.deadline)
        setParticipants(_data.participants)
        setOwnerAddress(_data.owner)
        setEntryFee(_data.entranceFee)
        // retrieveFiles(_data.raffleData)
    }
    console.log(_data)
    return _data
  }

  function checkIfAlreadyEntered() {
    
    if (account) {
      for (let i = 0; i < participants.length; i++) {
        const thisAccount = account.address.toLowerCase();
        if (participants[i].toLowerCase() == thisAccount) {
          return true;
        }
      }
    }
    return false;
  }

  function countEntries(participants_){
    if(participants_.length != 0){
      let ii = 0
      if (account) {
        for (let i = 0; i < participants_.length; i++) {
          const thisAccount = account.address.toLowerCase();
          if (participants_[i].toLowerCase() == thisAccount) {
            ii += 1
          }
        }
      }
      return ii;
    }
   return 0
  }

  const newEntry = async () => {
    try {
      const deffleContract = connectContract();
      if (deffleContract) {
        const txn = await deffleContract.enterRaffle(data.id, toBytes(passcode), {
          value: entryFee,
          gasLimit: 300000,
        });
        setLoading(true);
        console.log("Minting...", txn.hash);
  
        await txn.wait();
        console.log("Minted -- ", txn.hash);
        setSuccess(true);
        setLoading(false);
        setMessage("You have bought your raffle entry successfully.");
      } else {
        console.log("Error getting contract.");
      }
    } catch (error) {
      setSuccess(false);
      setMessage("Error!");
      setLoading(false);
      console.log(error);
    }
  };
  
  // fetchDetails(data.id)
  
  useEffect(()=>{
    fetchDetails(data.id)
  },[])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Head>
        <title>name | deffle</title>
        <meta name="description" content={"name"} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
       <section className="relative py-12">
        {loading && (
          <Alert
            alertType={"loading"}
            alertBody={"Please wait"}
            triggerAlert={true}
            color={"white"}
          />
        )}
        {success && (
          <Alert
            alertType={"success"}
            alertBody={message}
            triggerAlert={true}
            color={"palegreen"}
          />
        )}
        {success === false && (
          <Alert
            alertType={"failed"}
            alertBody={message}
            triggerAlert={true}
            color={"palevioletred"}
          />
        )}
      </section>
      
      <section className="relative py-12">
        <h6 className="mb-2">Deadline: {deadline}</h6>
        <h1 className="text-3xl tracking-tight font-extrabold text-gray-900 sm:text-4xl md:text-5xl mb-6 lg:mb-12">
          Name
        </h1>
        
        <div className="flex flex-wrap-reverse lg:flex-nowrap">
          <div className="w-full pr-0 lg:pr-24 xl:pr-32">
            <div className="mb-8 w-full aspect-w-10 aspect-h-7 rounded-lg bg-gray-100 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-100 focus-within:ring-indigo-500 overflow-hidden">
              
            </div>
            <p>Description</p>
            </div>
          </div>
          
          <div className="max-w-xs w-full flex flex-col gap-4 mb-6 lg:mb-0">
          <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:pt-5">
          <label
            htmlFor="event-link"
            className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
          >
            SECRET PASS CODE
           
          </label>
          <div className="mt-1 sm:mt-0 sm:col-span-2">
            <input
              id="event-link"
              name="event-link"
              type="text"
              className="block max-w-lg w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border border-gray-300 rounded-md"
              required
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
            />
          </div>
        </div>
          <div className="max-w-xs w-full flex flex-col gap-4 mb-6 lg:mb-0">
          {deadline  < currentTimestamp ? (
            account ? (
                <button
                  type="button"
                  className="w-full items-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={newEntry}
                >
                  Get slot for {entryFee} MATIC
                </button>
                
                ) : (
              <ConnectButton />
            )
          ) : (
                <span className="w-full text-center px-6 py-3 text-base font-medium rounded-full border-2 border-gray-200">
                  Event has ended
                </span>
          )}
          <div className="flex item-center">
              <UsersIcon className="w-6 mr-2" />
              <span className="truncate">
                {participants.length} people already participating
              </span>
            </div>
            <div className="flex item-center">
              <TicketIcon className="w-6 mr-2" />
              <span className="truncate">get as much slots as you want</span>
            </div>
            {checkIfAlreadyEntered() && 
                  <>
                    <span className="w-full text-center px-6 py-3 text-base font-medium rounded-full text-teal-800 bg-teal-100">
                      You have Bought {() => countEntries(participants)} entries🙌
                    </span>
                    <div className="flex item-center">
                      <LinkIcon className="w-6 mr-2 text-indigo-800" />
                      
                    </div>
                  </>
            }
            <div className="flex items-center">
              <EmojiHappyIcon className="w-10 mr-2" />
              <span className="truncate">
                Hosted by {ownerAddress}
                <a
                  className="text-indigo-800 truncate hover:underline"
                  href={`https://mumbai.polygonscan.com/address/${ownerAddress}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  
                </a>
              </span>
            </div>
          </div>
        </div>

      </section>
      
    </div> 

    )
  }


export default Event;

export async function getServerSideProps(context) {
  const { id } = context.params;
  // let data = {};
  // try{
    
  //   if(deffle){
  //     console.log("Yes")
  //    data  =  {
  //           id,
  //           "raffleData": await deffle.getRaffleData(id),
  //           "entranceFee":await deffle.getEntranceFee(id),
  //           "deadline":await deffle.getDeadline(id),
  //           "maxTickets":await deffle.getMaxPlayers(id),
  //           "participants":await deffle.getPlayers(id),
  //           "owner":await deffle.getRaffleOwner(id),
  //           "raffleState":await deffle.getRaffleState(id),
  //           "raffleBalance":await deffle.getRaffleBalance(id),
  //           "raffleWinner":await deffle.getRaffleWinner(id),
  //   }
  // }   
  // }
  // catch(err){
  //   console.log("eerrir")
  // }

  return {
    props: {
      data: context.params
    },
  }
}

