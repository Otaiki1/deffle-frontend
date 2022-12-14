import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";

import getRandomImage from "../utils/getRandomImage";
import { ethers } from "ethers";

import connectContract from "../utils/connectContract";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import Alert from "../components/Alert";

export default function CreateRaffle() {

  const { data: account } = useAccount();

  const [success, setSuccess] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(null);
  const [raffleID, setRaffleID] = useState(null);

  const [raffleName, setRaffleName] = useState("");
  const [raffleEndDate, setRaffleEndDate] = useState("");
  const [raffleEndTime, setRaffleEndTime] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("");
  const [entryFee, setEntryFee] = useState("");
  const [passCode, setPassCode] = useState("");
  const [raffleDescription, setRaffleDescription] = useState("");


  // const toBytes = (str) => {
  //   let coder = new ethers.utils.AbiCoder;
  //   return coder.encode(["string"], [str])
  // }
  // const fromBytes = (byt) =>  {
  //   let coder = new ethers.utils.AbiCoder;
  //   return coder.encode(["string"], byt)
  // }
  const toBytes = (str) => ethers.utils.formatBytes32String(str);
  const fromBytes = (byt) => ethers.utils.parseBytes32String(byt);
  const toEther = (str) => ethers.utils.parseEther(str);
  const fromEther = (eth) => Number(ethers.utils.formatEther(eth));

  async function handleSubmit(e) {

    e.preventDefault();
    console.log("Form submitted")

    const body = {
      name: raffleName,
      description: raffleDescription,
      image: getRandomImage(),
    };

    try {
      const response = await fetch("/api/store-event-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (response.status !== 200) {
        alert("Oops! Something went wrong. Please refresh and try again.");
      } else {
        console.log("Form successfully submitted!");
        let responseJSON = await response.json();
        await createEvent(responseJSON.cid);
      }
      // check response, if success is false, dont take them to success page
    } catch (error) {
      alert(
        `Oops! Something went wrong. Please refresh and try again. Error ${error}`
      );
    }
  }
  

  const createEvent = async (cid) => {
    try {
      const deffleContract = connectContract();
  
      if (deffleContract) {

        let creationFee = await deffleContract.getCreationFee();
        console.log(creationFee)
        creationFee = creationFee.toString();
        alert("This transaction would cost ", creationFee, " matic");

        let strData = cid;
        let entranceFee = toEther(entryFee)
        let raffleDateAndTime = new Date(`${raffleEndDate} ${raffleEndTime}`);
        let deadline = raffleDateAndTime.getTime();
        let passcode = toBytes(passCode);
  
        const txn = await deffleContract.createRaffle(
          strData,
          entranceFee,
          deadline,
          maxParticipants,
          passcode,
          { value: creationFee}
        );

        let idList = await deffleContract.getIdList();
        let id = idList[idList.length - 1].toString();
        console.log(id)
        setLoading(true);
        console.log("Minting...", txn.hash);
        
        // let wait = await txn.wait();
        // let decodedS = fromBytes(wait.events[0].data)
        // console.log(decodedS)
        console.log("Minted -- ", txn.hash);
        setRaffleID(id);
        setSuccess(true);
        setLoading(false);
        setMessage("Your event has been created successfully.");

      } else {
        console.log("Error getting contract.");
      }
    } catch (error) {
      setSuccess(false);
      setMessage(`There was an error creating your event: ${error.message}`);
      setLoading(false);
      console.log(error);
    }
  };
  

  useEffect(() => {
    // disable scroll on <input> elements of type number
    document.addEventListener("wheel", (event) => {
      if (document.activeElement.type === "number") {
        document.activeElement.blur();
      }
    });
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <Head>
        <title>Create your Raffle | Deffle</title>
        <meta
          name="description"
          content="Create your raffle on the blockchain"
        />
      </Head>
      <section className="relative py-12">
      {
  loading && (
    <Alert
      alertType={"loading"}
      alertBody={"Please wait"}
      triggerAlert={true}
      color={"white"}
    />
  )
}
{
  success && (
    <Alert
      alertType={"success"}
      alertBody={message}
      triggerAlert={true}
      color={"palegreen"}
    />
  )
}
{
  success === false && (
    <Alert
      alertType={"failed"}
      alertBody={message}
      triggerAlert={true}
      color={"palevioletred"}
    />
  )
}
  {
    !success && (
      <h1 className="text-3xl tracking-tight font-extrabold text-gray-900 sm:text-4xl md:text-5xl mb-4">
        Create your Raffle
      </h1>
    )
  }

  {
    account && !success && (<form
      onSubmit={handleSubmit}
      className="space-y-8 divide-y divide-gray-200"
    >
      <div className="space-y-6 sm:space-y-5">
        <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:pt-5">
          <label
            htmlFor="eventname"
            className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
          >
            Raffle name
          </label>
          <div className="mt-1 sm:mt-0 sm:col-span-2">
            <input
              id="event-name"
              name="event-name"
              type="text"
              className="block max-w-lg w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border border-gray-300 rounded-md"
              required
              value={raffleName}
              onChange={(e) => setRaffleName(e.target.value)}
            />
          </div>
        </div>

        <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:pt-5">
          <label
            htmlFor="date"
            className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
          >
            Deadline
            <p className="mt-1 max-w-2xl text-sm text-gray-400">
              The Date and Time your raffle should end
            </p>
          </label>
          <div className="mt-1 sm:mt-0 flex flex-wrap sm:flex-nowrap gap-2">
            <div className="w-1/2">
              <input
                id="date"
                name="date"
                type="date"
                className="max-w-lg block focus:ring-indigo-500 focus:border-indigo-500 w-full shadow-sm sm:max-w-xs sm:text-sm border border-gray-300 rounded-md"
                required
                value={raffleEndDate}
                onChange={(e) => setRaffleEndDate(e.target.value)}
              />
            </div>
            <div className="w-1/2">
              <input
                id="time"
                name="time"
                type="time"
                className="max-w-lg block focus:ring-indigo-500 focus:border-indigo-500 w-full shadow-sm sm:max-w-xs sm:text-sm border border-gray-300 rounded-md"
                required
                value={raffleEndTime}
                onChange={(e) => setRaffleEndTime(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:pt-5">
          <label
            htmlFor="max-capacity"
            className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
          >
            Max capacity
            <p className="mt-1 max-w-2xl text-sm text-gray-400">
              Limit the number of slots available for your raffle
            </p>
          </label>
          <div className="mt-1 sm:mt-0 sm:col-span-2">
            <input
              type="number"
              name="max-capacity"
              id="max-capacity"
              min="1"
              placeholder="100"
              className="max-w-lg block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:max-w-xs sm:text-sm border border-gray-300 rounded-md"
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(e.target.value)}
            />
          </div>
        </div>

        <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:pt-5">
          <label
            htmlFor="refundable-deposit"
            className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
          >
            Cost of RaffleTickets
            <p className="mt-1 max-w-2xl text-sm text-gray-400">
              How much should a ticket in your raffle game cost ?
            </p>
          </label>
          <div className="mt-1 sm:mt-0 sm:col-span-2">
            <input
              type="number"
              name="refundable-deposit"
              id="refundable-deposit"
              min="0"
              step="any"
              inputMode="decimal"
              placeholder="0.00"
              className="max-w-lg block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:max-w-xs sm:text-sm border border-gray-300 rounded-md"
              value={entryFee}
              onChange={(e) => setEntryFee(e.target.value)}
            />
          </div>
        </div>

        <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:pt-5">
          <label
            htmlFor="event-link"
            className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
          >
            SECRET PASS CODE
            <p className="mt-1 max-w-2xl text-sm text-gray-400">
              The secret pass code players interested in your raffle would use to join
            </p>
          </label>
          <div className="mt-1 sm:mt-0 sm:col-span-2">
            <input
              id="event-link"
              name="event-link"
              type="text"
              className="block max-w-lg w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border border-gray-300 rounded-md"
              required
              value={passCode}
              onChange={(e) => setPassCode(e.target.value)}
            />
          </div>
        </div>
        <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:pt-5">
          <label
            htmlFor="about"
            className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
          >
            Raffle Description
            <p className="mt-2 text-sm text-gray-400">
              Talk a bit about your raffle
            </p>
          </label>
          <div className="mt-1 sm:mt-0 sm:col-span-2">
            <textarea
              id="about"
              name="about"
              rows={10}
              className="max-w-lg shadow-sm block w-full focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border border-gray-300 rounded-md"
              value={raffleDescription}
              onChange={(e) => setRaffleDescription(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="pt-5">
        <div className="flex justify-end">
          <Link href="/">
            <a className="bg-white py-2 px-4 border border-gray-300 rounded-full shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Cancel
            </a>
          </Link>
          <button
            type="submit"
            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-full text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Create
          </button>
        </div>
      </div>
    </form>)
  } 
     
          
        

     {
  !account && (
    <section className="flex flex-col items-start py-8">
      <p className="mb-4">Please connect your wallet to create Raffles.</p>
      <ConnectButton />
    </section>
  )
}
{
  success && raffleID && (
    <div>
      Success! Please wait a few minutes, then check out your RAffle page{" "}
      <span className="font-bold">
        <Link href={`/event/${raffleID}`}>here</Link>
      </span>
    </div>
  )
}
      </section>
    </div>
  );
}
