const Card = require('./card');

// representation of a deck of standard (52) playing cards
const Deck = function () {
  this.cards = [];

  const constructor = (function (deck) {
    const suits = ['♠', '♥', '♦', '♣'];
    for (let i = 0; i < suits.length; i++) {
      let cardName;
      switch (suits[i]) {
        case '♠':
          cardName = 'p';
          break;
        case '♥':
          cardName = 'c';
          break;
        case '♦':
          cardName = 'r';
          break;
        case '♣':
          cardName = 't';
          break;
      }

      for (let j = 1; j <= 13; j++) {
        if (j === 1) {
          deck.cards.push(new Card('A', suits[i], cardName + '_A'));
        } else if (j === 11) {
          deck.cards.push(new Card('J', suits[i], cardName + '_J'));
        } else if (j === 12) {
          deck.cards.push(new Card('Q', suits[i], cardName + '_Q'));
        } else if (j === 13) {
          deck.cards.push(new Card('K', suits[i], cardName + '_K'));
        } else {
          deck.cards.push(new Card(j, suits[i], cardName + '_' + j));
        }
      }
    }
  })(this);

  this.shuffle = () => {
    this.cards = [];
    const suits = ['♠', '♥', '♦', '♣'];
    for (let i = 0; i < suits.length; i++) {
      let cardName;
      switch (suits[i]) {
        case '♠':
          cardName = 'p';
          break;
        case '♥':
          cardName = 'c';
          break;
        case '♦':
          cardName = 'r';
          break;
        case '♣':
          cardName = 't';
          break;
      }
      for (let j = 1; j <= 13; j++) {
        if (j === 1) {
          this.cards.push(new Card('A', suits[i], cardName + '_A'));
        } else if (j === 11) {
          this.cards.push(new Card('J', suits[i], cardName + '_J'));
        } else if (j === 12) {
          this.cards.push(new Card('Q', suits[i], cardName + '_Q'));
        } else if (j === 13) {
          this.cards.push(new Card('K', suits[i], cardName + '_K'));
        } else {
          this.cards.push(new Card(j, suits[i], cardName + '_' + j));
        }
      }
    }
  };

  this.dealRandomCard = () => {
    const index = Math.floor(Math.random() * this.cards.length);
    value = this.cards[index];
    this.cards.splice(index, 1);
    return value;
  };
};

module.exports = Deck;
