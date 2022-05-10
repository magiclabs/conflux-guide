import React, { useEffect, useState } from "react";
import { useHistory } from "react-router";
import { magic } from "../magic";
import { Conflux, Drip } from 'js-conflux-sdk';
import Loading from "./Loading";

export default function Profile() {
  const [conflux, setConflux] = useState();
  const [userMetadata, setUserMetadata] = useState({});
  const [cfxBalance, setCfxBalance] = useState(0);
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [disableInputs, setDisableInputs] = useState(false);
  const [sendingTransaction, setSendingTransaction] = useState(false);
  const [deployingContract, setDeployingContract] = useState(false);
  const [updatingContract, setUpdatingContract] = useState(false);
  const [transactionHash, setTransactionHash] = useState();
  const [deployContractTxHash, setDeployContractTxHash] = useState();
  const [updateContractTxHash, setUpdateContractTxHash] = useState();
  const [message, setMessage] = useState('...');
  const [newMessage, setNewMessage] = useState('');
  const history = useHistory();
  const contractAddress = "cfxtest:ace81v913t0whdmtppp15e2gupnw2utfta2kanjvcb";
  const contractAbi = [
    {
      "inputs": [],
      "name": "message",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "newMessage",
          "type": "string"
        }
      ],
      "name": "update",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];

  // Create Conflux instance to query blockchain (getBalance, getContract, etc)
  useEffect(() => {
    (async function() {
      let cfx = await Conflux.create({ url: "https://test.confluxrpc.com" });
      setConflux(cfx);
    })()
  }, []);

  useEffect(() => {
    if (!conflux) return;
    // On mount, we check if a user is logged in.
    // If so, we'll retrieve the authenticated user's profile.
    (async function() {
      let magicIsLoggedIn = await magic.user.isLoggedIn();
        if (magicIsLoggedIn) {
          let user = await magic.user.getMetadata();
          setUserMetadata(user);
          getBalance(user.publicAddress);
          getContractMessage();
        } else {
          // If no user is logged in, redirect to `/login`
          history.push("/login");
        }
    })()
  }, [conflux]);

  const getBalance = (address) => {
    conflux.getBalance(address).then(setCfxBalance);
  };

  const sendTransaction = async () => {
    if (!toAddress || !amount) return alert('Required fields missing');
    setDisableInputs(true);
    setTransactionHash();
    setSendingTransaction(true);

    // Send transaction object to Magic to sign and broadcast
    let receipt = await magic.conflux.sendTransaction({
      from: userMetadata.publicAddress,
      to: toAddress,
      value: Drip.fromCFX(amount),
      gasPrice: Drip.fromGDrip(1),
      nonce: await conflux.getNextNonce(userMetadata.publicAddress),
    });

    console.log(receipt);
    setDisableInputs(false);
    setTransactionHash(receipt.transactionHash);
    setSendingTransaction(false);
    setToAddress('');
    setAmount('');
    getBalance(userMetadata.publicAddress);
  }


  const deployContract = async () => {
    setDisableInputs(true);
    setDeployContractTxHash();
    setDeployingContract(true);
    // This bytecode is generated from compiling the HelloWorld smart contract in HelloWorld.sol
    let bytecode = "0x60806040526040518060400160405280600d81526020017f6669727374206d657373616765000000000000000000000000000000000000008152506000908051906020019061004f929190610062565b5034801561005c57600080fd5b5061010d565b828054600181600116156101000203166002900490600052602060002090601f01602090048101928261009857600085556100df565b82601f106100b157805160ff19168380011785556100df565b828001600101855582156100df579182015b828111156100de5782518255916020019190600101906100c3565b5b5090506100ec91906100f0565b5090565b5b808211156101095760008160009055506001016100f1565b5090565b6103128061011c6000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c80633d7403a31461003b578063e21f37ce146100f6575b600080fd5b6100f46004803603602081101561005157600080fd5b810190808035906020019064010000000081111561006e57600080fd5b82018360208201111561008057600080fd5b803590602001918460018302840111640100000000831117156100a257600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f820116905080830192505050505050509192919290505050610179565b005b6100fe610193565b6040518080602001828103825283818151815260200191508051906020019080838360005b8381101561013e578082015181840152602081019050610123565b50505050905090810190601f16801561016b5780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b806000908051906020019061018f929190610231565b5050565b60008054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156102295780601f106101fe57610100808354040283529160200191610229565b820191906000526020600020905b81548152906001019060200180831161020c57829003601f168201915b505050505081565b828054600181600116156101000203166002900490600052602060002090601f01602090048101928261026757600085556102ae565b82601f1061028057805160ff19168380011785556102ae565b828001600101855582156102ae579182015b828111156102ad578251825591602001919060010190610292565b5b5090506102bb91906102bf565b5090565b5b808211156102d85760008160009055506001016102c0565b509056fea26469706673582212200e3cb1c1d3d536ab95bea114816146d992855e0dc4aff346ea1a3040710d09f764736f6c63430007060033"
    let receipt = await magic.conflux.sendTransaction({
      from: userMetadata.publicAddress,
      data: bytecode,
      gasPrice: Drip.fromGDrip(1),
      nonce: await conflux.getNextNonce(userMetadata.publicAddress),
    });
    console.log(receipt);
    setDisableInputs(false);
    setDeployContractTxHash(receipt.transactionHash);
    setDeployingContract(false);
    getBalance(userMetadata.publicAddress);
  }

  const getContractMessage = async () => {
    const contract = conflux.Contract({ address: contractAddress, abi: contractAbi });
    const msg = await contract.message();
    setMessage(msg);
  }

  const updateContractMessage = async () => {
    if (!newMessage) return alert('Required fields missing');
    setDisableInputs(true);
    setUpdateContractTxHash();
    setUpdatingContract(true);
    const contract = conflux.Contract({ address: contractAddress, abi: contractAbi });
    const tx = contract.update(newMessage);
    const txPayload = {
      to: tx.to,
      from: userMetadata.publicAddress,
      data: tx.data,
      gasPrice: Drip.fromGDrip(1),
      nonce: await conflux.getNextNonce(userMetadata.publicAddress),
    }
    const receipt = await magic.conflux.sendTransaction(txPayload);
    console.log(receipt);
    setDisableInputs(false);
    setUpdateContractTxHash(receipt.transactionHash);
    setUpdatingContract(false);
    getContractMessage();
    setNewMessage('');
  }

  const logout = () => {
    magic.user.logout().then(() => {
      history.push("/login");
    })
  };

  return userMetadata ? <>

    <div className="container">
      <h1>Current user</h1>
      <div className="info">{userMetadata.email}</div>
      <button onClick={logout}>Logout</button>
    </div>

    <div className="container">
      <h1>Public Address</h1>
      <div className="info">{userMetadata.publicAddress}</div>
      <h1>Balance</h1>
      <div className="info">{Drip(cfxBalance).toCFX().toString().substring(0, 8)} CFX</div>
    </div>

    <div className="container">
      <h1>Send Transaction</h1>
      <input 
        placeholder="To Address" 
        value={toAddress} 
        onChange={(e) => setToAddress(e.target.value)}
        disabled={disableInputs}
        />
      <input 
        placeholder="Amount (in CFX)" 
        value={amount} 
        onChange={(e) => setAmount(e.target.value)}
        disabled={disableInputs}
        /><br />
      <button onClick={sendTransaction} disabled={disableInputs}>Send</button>
      {transactionHash && <div>
        <a href={`https://testnet.confluxscan.io/transaction/${transactionHash}`} target="_blank">
        View Transaction ↗️
        </a>
      </div>}
      {sendingTransaction && <div>Sending transaction...</div>}
    </div> 

    <div className="container">
      <h1>Deploy New Contract</h1>
      <button onClick={deployContract} disabled={disableInputs}>Deploy</button>
      {deployContractTxHash && <div>
        <a href={`https://testnet.confluxscan.io/transaction/${deployContractTxHash}`} target="_blank">
        View Transaction ↗️
        </a>
      </div>}
      {deployingContract && <div>Sending transaction...</div>}
    </div> 

    <div className="container">
      <h1>Smart Contract Call</h1>
      <div>`message` value:</div><br />
      <div className="info">{message}</div>
      <h1>Update `message`</h1>
      <input 
        placeholder="New Message..." 
        value={newMessage} 
        onChange={(e) => setNewMessage(e.target.value)} 
        disabled={disableInputs} 
        /><br />
      <button onClick={updateContractMessage} disabled={disableInputs}>Update Contract</button>
      {updateContractTxHash && <div>
        <a href={`https://testnet.confluxscan.io/transaction/${updateContractTxHash}`} target="_blank">
        View Transaction ↗️
        </a>
      </div>}
      {updatingContract && <div>Sending transaction...</div>}
    </div>

  </> : <Loading />;
}
