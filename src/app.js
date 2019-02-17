App = {
  loading: false,
  contracts: {},
  addrCache: "",
  types: ["Bank", "Government", "Company"],

  load: async () => {
    await App.loadWeb3()
    await App.loadAccount()
    await App.loadContract()
    await App.initUsers()
    await App.initScore()
    await App.render()
  },

  loadWeb3: async () => {
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider
      web3 = new Web3(web3.currentProvider)
    } else {
      window.alert("Please connect to Metamask.")
    }
    // Modern dapp browsers...
    if (window.ethereum) {
      window.web3 = new Web3(ethereum)
      try {
        // Request account access if needed
        await ethereum.enable()
        // Acccounts now exposed
        web3.eth.sendTransaction({/* ... */})
      } catch (error) {
        // User denied account access...
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = web3.currentProvider
      window.web3 = new Web3(web3.currentProvider)
      // Acccounts always exposed
      web3.eth.sendTransaction({/* ... */})
    }
    // Non-dapp browsers...
    else {
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  },

  loadAccount: async () => {
    // Set the current blockchain account
    App.account = web3.eth.accounts[0]
  },

  loadContract: async () => {
    // Create a JavaScript version of the smart contract
    const credit = await $.getJSON('Credit.json')
    App.contracts.Credit = TruffleContract(credit)
    App.contracts.Credit.setProvider(App.web3Provider)

    // Hydrate the smart contract with values from the blockchain
    App.credit = await App.contracts.Credit.deployed()
  },

  initUsers: async() => {
    // await App.credit.initCorp("Doe", 1)
    // await App.credit.initUser("JJ", "daibi")
    
    const type = await App.credit.getType.call()
    App.type = type.toNumber()
    if(App.type == 0) {
      $('.ck-bank').show()
      $('.ck-gov').hide()
      $('.ck-com').hide()
    } else if (App.type==1) {
      $('.ck-bank').hide()
      $('.ck-gov').show()
      $('.ck-com').hide()
    } else {
      $('.ck-bank').hide()
      $('.ck-gov').hide()
      $('.ck-com').show()
    }
    console.log(App.type)
    $('#acc-type').html(App.types[App.type])
  },

  initScore: async () => {
    if(App.addrCache=="") {
      App.score = "--"
      App.rank = "unchecked"
      App.pname = "blank"
      App.govId = "blank"
    } else {
      const s1 = await App.credit.checkScore.call(App.addrCache)
      App.score = s1[0].toNumber()
      if (App.score >=90) {
        App.rank = "excellent"
      } else if (App.score >=80) {
        App.rank = "good"
      } else if (App.score >=40) {
        App.rank = "normal"
      } else {
        App.rank = ""
      }
      App.pname = s1[1]
      App.govId = s1[2]
    }
  },

  loadScore: async () => {
    const content = $('#checkInput').val()
    App.addrCache = content
    try {
      const score = await App.credit.checkScore.call(content)
      $('.err-board').hide()
      
      console.log(score)
      App.score = score[0].toNumber()
      console.log(App.score)
      if (App.score >=90) {
        App.rank = "excellent"
      } else if (App.score >=80) {
        App.rank = "good"
      } else if (App.score >=40) {
        App.rank = "normal"
      } else {
        App.rank = ""
      }
      App.pname = score[1]
      App.govId = score[2]

      App.render()
    } catch(err) {
      
      $('.err-board').fadeIn()
    }
  },

  registerUser: async() => {
    const content = $('#checkInput').val()
    const content2 = $('#checkInput2').val()
    if (document.getElementById('user-type').checked){ 
      App.regChoice = 0
    } else if (document.getElementById('corp-type').checked) {
      App.regChoice = 1
    }
    
    if (App.regChoice == 0) {
      try {
        await App.credit.initUser(content, content2)
        $('.err-board').hide()
      } catch (err) {
        $('.err-board').fadeIn()
      }
    } else {
      try {
        await App.credit.initCorp(content, content2)
        $('.err-board').hide()
      } catch (err) {
        $('.err-board').fadeIn()
      }
    }
  },

  updateScore: async() => {
    const content = $('#checkInput').val()
    if (document.getElementById('gov1').checked || document.getElementById('com1').checked || document.getElementById('bank1').checked){ 
      App.choice = 0
      $('#chg').html("-10")
    } else if (document.getElementById('gov2').checked || document.getElementById('com2').checked || document.getElementById('bank2').checked) {
      App.choice = 1
      $('#chg').html("+10")
    }
    try {
      await App.credit.modScore(App.choice, content)
      $('.err-board').hide()
      $('.c-dsboard').fadeIn()
    } catch(err) {
      $('.c-dsboard').hide()
      $('.err-board').fadeIn()
    }
  },

  render: async () => {
    if (App.loading) {
      return
    }

    // Update app loading state
    App.setLoading(true)

    // Render Account
    $('#account').html(App.account)
    $('#score').html(App.score)
    $('#rank').html(App.rank)
    $('#pname').html(App.pname)
    $('#gov-id').html(App.govId)

    App.setLoading(false)
  },



  setLoading: (boolean) => {
    App.loading = boolean
    const loader = $('#loader')
    const content = $('#content')
    if (boolean) {
      loader.show()
      content.hide()
    } else {
      loader.hide()
      content.show()
    }
  }
}

$(() => {
  $(window).load(() => {
    App.load()
  })
})
