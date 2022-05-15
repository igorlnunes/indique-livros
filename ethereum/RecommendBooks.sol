//SPDX-License-Identifier:UNLICENSED

pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract RecommendBooks {
    uint256 totalRecommends;
    uint256 seed;
    
    event NewRecommend(address indexed from, uint256 timestamp, string author, string title);

    struct Recommendation {
        address pointer;
        string author;
        string title;
        uint256 timestamp;
    }

    Recommendation[] recommendations;

    mapping(address => uint256) public lastRecommendAt;

    constructor() payable {
        console.log("Contrato construido com sucesso.");

        seed = (block.timestamp + block.difficulty) % 100;
    }

    function point(string memory _author, string memory _title) public {

        require(
            lastRecommendAt[msg.sender] + 15 minutes < block.timestamp,
            "Aguarde 15 minutos... Para tentar novamente."
        );

        lastRecommendAt[msg.sender] = block.timestamp;

        totalRecommends++;
        console.log("%s indicou o livro %s do autor(a) %s", msg.sender, _title, _author);

        recommendations.push(Recommendation(msg.sender, _author, _title, block.timestamp));

        seed = (block.difficulty + block.timestamp + seed) % 100;

        if (seed <= 50) {
            console.log("%s venceu!!", msg.sender);

            uint256 prizeAmount = 0.0001 ether;
            require(
                prizeAmount <= address(this).balance,
                "Tentando sacar mais dinheiro que o contrato possui."
            );
            (bool success, ) = (msg.sender).call{value: 
            prizeAmount}("");
            require(success, "Falhou em sacar dinheiro do contrato.");
        }

        emit NewRecommend(msg.sender, block.timestamp, _author, _title);
    }

    function getAllRecommendations() public view returns (Recommendation[] memory) {
        return recommendations;
    }

    function getTotalRecommendations() public view returns (uint256) {
        return totalRecommends;
    }
}