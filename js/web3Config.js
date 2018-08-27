var setProvider = function(){
  if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
    // console.log(web3);
  } else {
    // set the provider you want from Web3.providers
    console.log('No web3? You should consider trying MetaMask!')
  }
};
setProvider();
