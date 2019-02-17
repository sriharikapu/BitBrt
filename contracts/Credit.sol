pragma solidity >=0.5.0 <0.6.0;

contract Credit{

	struct User{
		address own;
		string name;
		string govID;
		uint score;
		bool exists;
		mapping (address => uint) viewCert;
	}

	struct Corp{
		address own;
		string name;
		corpType _type;
		bool exists;
		uint viewCert;
		mapping (address => uint) modCert;
	}
	
	mapping (address => User) private userPool;
	mapping (address => Corp) private corpPool;
	enum corpType {bank, gov, company}


	//event scoreCheck(int score, string memory name, string memory ID, bool sucess);

	modifier onlyUser(address target){
		require(userPool[target].exists == true);
		_;
	}

	modifier onlyCorp(address sender){
		require(corpPool[sender].exists == true, "Your account type has no authorization");
		_;
	}

	constructor() public {
		initCorp("The Government", 1);
	}

	function initUser(string memory name, string memory govID) public{
        userPool[msg.sender] = User({
        own: msg.sender,
	    name: name,
	    govID: govID,
	    score: 50,
	    exists: true
        });
        userPool[msg.sender].viewCert[msg.sender] = 2;
	}

	function initCorp(string memory name, uint _type) public{
		corpPool[msg.sender] = Corp({
	    own: msg.sender,
	    name: name,
	    _type: corpType(_type),
	    exists: true,
	    viewCert: 2
	    });
	}

	function checkScore(address target) public view returns(uint, string memory,string memory,bool,string memory){
		if (userPool[target].exists == false){
			return (0,"N/A", "N/A", false, "Not Registered");
		}
		require(corpPool[msg.sender].exists == true || userPool[msg.sender].exists == true, "You are not Registered");
		if (corpPool[msg.sender].exists == true){
			uint viewCert = corpPool[msg.sender].viewCert;
			if (viewCert==1){
				return (userPool[target].score,userPool[target].name, "No Authorization", true,"");
			}else if (viewCert==2){
				return (userPool[target].score,userPool[target].name, userPool[target].govID, true,"");
			}
		}else if (userPool[msg.sender].exists == true){
			uint viewCert = userPool[msg.sender].viewCert[target];
			if (viewCert == 0) {
				viewCert = 1;
			}		//*******************Only for testing
			if (viewCert==1){
				return (userPool[target].score,userPool[target].name, "No Authorization", true,"");
			}else if (viewCert==2){
				return (userPool[target].score,userPool[target].name, userPool[target].govID, true,"");
				}else{
				return (0,"No Authorization", "No Authorization", false,"No Authorization");
			}

		}

	}

	function getType() public view returns(uint){
		if (corpPool[msg.sender]._type == corpType.bank){
			return 0;
		}else if (corpPool[msg.sender]._type == corpType.gov){
			return 1;
		}else if (corpPool[msg.sender]._type == corpType.company){
			return 2;
		}else{
		    return 99;
		}
	}

	function modScore(uint reason, address target) public onlyCorp(msg.sender) returns(int, bool, string memory){
		corpPool[msg.sender].modCert[target] = 1;		//*******************Only for testing
		if (userPool[target].exists == false){
			return (0,false,"User not Registered");
		}else if (corpPool[msg.sender].modCert[target]==0){
			return (0,false,"Not Authorized");
		}
		if (reason==0){
			userPool[target].score -= 10;
			return (-10,true,"");
		}else if (reason==1){
			userPool[target].score += 10;
			return (10,true,"");
		}

	}
}
