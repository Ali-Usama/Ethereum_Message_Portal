import React, {useEffect, useState} from "react";
import {ethers} from "ethers";
import "./App.css";
import abi from './utils/MyWavePortal.json';

const App = () => {
    const [currentAccount, setCurrentAccount] = useState("");

    const [allMessages, setAllMessages] = useState([]);
    const [message, setMessage] = useState("");
    const contractAddress = "0xfaeE3748AeA16697AF95F44007b71A3D9B8Be5d5"
    const contractABI = abi.abi;

    const handleChange = event => {
        setMessage(event.target.value);
    }

    const getAllMessages = async () => {
        try {
            const {ethereum} = window;
            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const portalContract = new ethers.Contract(contractAddress, contractABI, signer);

                const messages = await portalContract.getAllMessages();

                let messagesCleaned = [];
                messages.forEach(message => {
                    messagesCleaned.push({
                        address: message.sender,
                        timestamp: new Date(message.timestamp * 1000),
                        message: message.message
                    });
                });
                setAllMessages(messagesCleaned);
            } else {
                console.log("Ethereum object doesn't exist!");
            }
        } catch (error) {
            console.log(error)
        }
    }

    const checkIfWalletIsConnected = async () => {
        try {
            const {ethereum} = window;

            if (!ethereum) {
                console.log("Make sure you have metamask!");
                return;
            } else {
                console.log("We have the ethereum object", ethereum);
            }

            const accounts = await ethereum.request({method: "eth_accounts"});

            if (accounts.length !== 0) {
                const account = accounts[0];
                console.log("Found an authorized account:", account);
                setCurrentAccount(account);
                await getAllMessages()
            } else {
                console.log("No authorized account found")
            }
        } catch (error) {
            console.log(error);
        }
    }

    /**
     * Implement your connectWallet method here
     */
    const connectWallet = async () => {
        try {
            const {ethereum} = window;

            if (!ethereum) {
                alert("Get MetaMask!");
                return;
            }

            const accounts = await ethereum.request({method: "eth_requestAccounts"});

            console.log("Connected", accounts[0]);
            setCurrentAccount(accounts[0]);
        } catch (error) {
            console.log(error)
        }
    }

    const sendMessage = async () => {
        try {
            const {ethereum} = window;

            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const portalContract = new ethers.Contract(contractAddress, contractABI, signer);

                let messages = await portalContract.getTotalMessages();
                console.log("Total Retrieved Messages: ", messages.toNumber());

                const messageTxn = await portalContract.sendMessage(message);
                console.log("Sending Message...", messageTxn.hash);

                await messageTxn.wait();
                console.log("Message sent: ", messageTxn.hash);

                messages = await portalContract.getTotalMessages();
                console.log("Total Retrieved Messages: ", messages.toNumber());
            } else {
                console.log("Ethereum object does not exist!")
            }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        checkIfWalletIsConnected();
    }, [])

    return (
        <div className="mainContainer">
            <div className="dataContainer">
                <div className="header">
                    👋 Hey there! Leave a Message for 0.0001 ETH
                </div>

                <div className="bio">
                    I am Usama and I work on Ethereum & Solana so that's pretty cool right? Connect your Ethereum
                    wallet and leave a message for me!
                </div>
                <input type="text"
                       id="message"
                       name="message"
                       onChange={handleChange}
                       value={message}/>

                <button className="waveButton" onClick={sendMessage}>
                    Leave Message
                </button>

                {/*
        * If there is no currentAccount render this button
        */}
                {!currentAccount && (
                    <button className="waveButton" onClick={connectWallet} style={{backgroundColor: "Red"}}>
                        Connect Wallet
                    </button>
                )}

                {allMessages.map((message, index) => {
                    return (
                        <div key={index} style={{backgroundColor: "OldLace", marginTop: "16px", padding: "8px"}}>
                            <div>Address: {message.address}</div>
                            <div>Time: {message.timestamp.toString()}</div>
                            <div>Message: {message.message}</div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}

export default App