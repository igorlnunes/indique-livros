import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import abi from "./utils/RecommendBooks.json";

export default function App() {

  const [currentAccount, setCurrentAccount] = useState('');
  const [recommendation, setRecommendation] = useState([{author: "", title: ""}]);
  const [allWaves, setAllWaves] = useState([]);

  const contractAddress = "0x1f4271EFC01dC449A39b7d841329eb966f0f7DaE";

  const contractABI = abi.abi;

  const checkIfWalletIsConnected = async () => {
    try {
      //Primeiro checamos se temos acesso ao objeto windows.ethereum
      const { ethereum } = window;
  
      if(!ethereum) {
        console.log("Não esqueça de instalar a MetaMask!");
        return
      } else {
        console.log("Achamos o ethereum", ethereum);
      }

      //confirma se estamos autorizados a acessar a carteira do cliente
      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Encontrada a conta autorizada:", account);
        setCurrentAccount(account);
        getAllRecommendations();
      } else {
        console.log("Nenhuma conta autorizada foi encontrada")
      }
    } catch(error) {
      console.log("Autorização deu ruim...", error);
      }
    }

  const connectWallet = async () => {
    try{
      const { ethereum } = window;

      if(!ethereum) {
        alert("MetaMask encontrada!");
        return;
      }
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      // const balance = await ethereum.request({ method: "eth_requestBalance" });

      console.log("Conectado: ", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch(error) {
      console.log("Erro de conexão com a wallet ", error);
    }
  }

  const point = async () => {
    try{
      const { ethereum } = window;

      if(ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const booksContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await booksContract.getTotalRecommendations();
        console.log("Número de recomendações: ", count.toNumber());

        const waveTxn = await booksContract.point(recommendation.author, recommendation.title);
        console.log("Minerando...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Minerando -- ", waveTxn.hash);

        count = await booksContract.getTotalRecommendations();
        console.log("Total de recomendações: ", count.toNumber());
      } else {
        console.log("O objeto Ethereum não encontrado!!");
      }
    } catch (error) {
      console.log("Deu ruim na obtenção dos tchauzinhos", error)
    }
  }

  const getAllRecommendations = async () => {
    try{
      const { ethereum } = window;
      if(ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const booksContract = new ethers.Contract(contractAddress, contractABI, signer);

        const recommendations = await booksContract.getAllRecommendations();

        let booksCleaned = [];
        recommendations.forEach(recom => {
          booksCleaned.push({
              address: recom.pointer,
              timestamp: new Date(recom.timestamp * 1000,),
              author: recom.author,
              title: recom.title,
          });
        });

        setAllWaves(booksCleaned);
        console.log(allWaves);
      } else {
        console.log("Objeto Ethereum não existe!")
      }
    } catch(error) {
      console.log("Xi deu ruim novamente", error);
    }
  }
  
  
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);


  
  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
        Indiquem-me livros 📚
        </div>

        <div className="bio">
        Eu sou o Igor, eu também construo, destruo e reconstruo algumas soluções em Web3. Além disso, gosto de ler. Você poderia me ajudar indicando algum livro?
        </div>

        <div className="inputs">
          <input 
            type="text"
            required
            placeholder="Título da Obra"
            className="border rounded p-4"
            onChange={(e) => setRecommendation({...recommendation, title: e.target.value})}
          />
          <input
            type="text"
            placeholder="Autor da Obra"
            className="border rounded p-4"
            onChange={(e) => setRecommendation({...recommendation, author: e.target.value})}
          />        
        </div>
        <button className="waveButton" onClick={point}>
          Indicar Livro
        </button>
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Conectar Carteira
          </button>
        )}

        { allWaves.map((point, index) => {
          return(
            <div key={index} style={{backgroundColor: "plum", marginTop: "16px", padding: "8px"}}>
              <div style={{backgroundColor: "goldenrod", marginTop: "8px", padding: "8px"}}>
                <div style={{marginLeft: "32px", padding:"6px"}} >Título: {point.title}</div>
                <div style={{marginLeft: "32px", padding:"6px"}}>Autor: {point.author}</div>              
              </div>
              <div>Data/Horário: {point.timestamp.toString().slice(0,-38)}</div>
              <div>Endereço: {point.address}</div>
            </div>)
        })}

         
      </div>      
    </div>
  );
}
