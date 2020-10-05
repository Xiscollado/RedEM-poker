const Player = function (p, socket, debug) {
  this.username = p.name;
  this.id = p.id;
  this.cards = [];
  this.socket = socket;
  this.currentCard = null;
  this.money = parseFloat(p.money);
  this.buyIns = 0;
  this.status = '';
  this.blindValue = '';
  this.dealer = false;
  this.allIn = false;
  this.goAgainStatus = false;
  this.debug = debug || false;

  this.addCard = (card) => {
    this.cards.push(card);
  };


  this.setStatus = (data) => (this.status = data);
  this.setBlind = (data) => (this.blindValue = data);
  this.setDealer = (data) => (this.dealer = data);
  this.getUsername = () => {
    return this.username;
  };
  this.getBuyIns = () => {
    return this.buyIns;
  };
  this.getMoney = () => {
    console.log(`player ${this.username} money is ${this.money}`)
    return parseFloat(this.money);
  };
  this.getStatus = () => {
    return this.status;
  };
  this.getBlind = () => {
    return this.blindValue;
  };
  this.getDealer = () => {
    return this.dealer;
  };

  this.emit = (eventName, payload) => {
    this.socket.emit(eventName, payload);
  };
};

module.exports = Player;
