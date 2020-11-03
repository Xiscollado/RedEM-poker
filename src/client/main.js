$(document).ready(function () {
  $('#gameDiv').hide()
  $('.modal-trigger').leanModal()
  $('.tooltipped').tooltip({ delay: 50 })
})

var getUrlParameter = function getUrlParameter(sParam) {
  var sPageURL = window.location.search.substring(1),
    sURLVariables = sPageURL.split('&'),
    sParameterName,
    i;

  for (i = 0; i < sURLVariables.length; i++) {
    sParameterName = sURLVariables[i].split('=');

    if (sParameterName[0] === sParam) {
      return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
    }
  }
};

var rdrCharacter = { name: getUrlParameter('name'), id: "n/a", money: Number(getUrlParameter('money')) };
var myMoney = getUrlParameter('money');
var socket = io()
var gameInfo = null

socket.on('playerDisconnected', function (data) {
  Materialize.toast(data.player + ' Ha salido.', 4000)
})

socket.on('hostRoom', function (data) {
  $('.testInfo').hide();
  if (data != undefined) {
    //Envía el código al cliente
    if (data.players.length == 1) {
      // parent.getCode(data.code);
    }

    if (data.players.length >= 5) {

      $('#hostModalContent').html(
        '<h5>Código:</h5><code>' +
        data.code +
        '</code><br /><h5>El número máximo de jugadores en la timba es de 5.</h5><h5>Jugadores actualmente en la timba</h5>'
      )
      $('#playersNames').html(
        data.players.map(function (p) {
          return '<span>' + p + '</span><br />'
        })
      )

    } else if (data.players.length > 1) {

      $('#hostModalContent').html(
        '<h5>Código:</h5><code>' +
        data.code +
        '</code><br /><h5>Jugadores sentándose a la mesa</h5>'
      )
      $('#playersNames').html(
        data.players.map(function (p) {
          return '<span>' + p + '</span><br />'
        })
      )
      $('#startGameArea').html(
        '<br /><button onclick=startGame(' +
        data.code +
        ') type="submit" class= "waves-effect waves-light red darken-3 white-text btn-flat">Comenzar la timba</button >'
      )

    } else {

      $('#hostModalContent').html(
        '<h5>Código:</h5><code>' +
        data.code +
        '</code><br /><h5>Jugadores actualmente en la timba</h5>'
      )
      $('#playersNames').html(
        data.players.map(function (p) {
          return '<span>' + p + '</span><br />'
        })
      )

    }
  } else {

    Materialize.toast(
      'Ups. no hay baraja! Sal y entra de nuevo en la mesa.',
      4000
    )
    $('#joinButton').removeClass('disabled')

  }
})

socket.on('hostRoomUpdate', function (data) {
  $('#playersNames').html(
    data.players.map(function (p) {
      return '<span>' + p + '</span><br />'
    })
  )
  if (data.players.length == 1) {
    $('#startGameArea').empty()
  }
})

socket.on('joinRoomUpdate', function (data) {
  $('#startGameAreaDisconnectSituation').html(
    '<br /><button onclick=startGame(' +
    data.code +
    ') type="submit" class= "waves-effect waves-light red darken-3 white-text btn-flat">Comenzar timba</button >'
  )
  $('#joinModalContent').html(
    '<h5>' +
    data.host +
    '</h5><hr /><h5>Jugadores en la Timba</h5><p>Ahora eres el anfitrión.</p>'
  )

  $('#playersNamesJoined').html(
    data.players.map(function (p) {
      return '<span>' + p + '</span><br />'
    })
  )
})

socket.on('joinRoom', function (data) {
  $('.testInfo').hide();
  if (data == undefined) {
    $('#joinModal').closeModal()
    Materialize.toast(
      'Introduce un código válido. O se ha alcanzado el número máximo de jugadores (7)',
      4000
    )
    $('#hostButton').removeClass('disabled')
  } else {
    $('#joinModalContent').html(
      '<h5> Organizador: ' + data.players[0] +
      '</h5><p class="text-white">Por favor, espera a que el creador de la timba la comienze o desconéctate. </p>'
    )
    $('#playersNamesJoined').html(
      data.players.map(function (p) {
        return '<span>' + p + '</span><br />'
      })
    )
  }
})

socket.on('dealt', function (data) {
  $('#mycards').html(
    data.cards.map(function (c) {
      return renderCard(c)
    })
  )
  $('#usernamesCards').text(data.username + ' - Mis cartas')
  $('#mainContent').remove()
})

socket.on('rerender', function (data) {
  if (data.myBet == 0) {
    $('#usernamesCards').text('Mis cartas')
  } else {
    $('#usernamesCards').text('Mi apuesta: $' + data.myBet)
  }
  if (data.community != undefined)
    $('#communityCards').html(
      data.community.map(function (c) {
        return renderCard(c)
      })
    )
  else $('#communityCards').html('<p></p>')
  if (data.currBet == undefined) data.currBet = 0
  $('#table-title').html(
    'Partida ' +
    data.round +
    '    |   <span class="red-text"> ' +
    data.stage +
    '</span>    |    Apuesta más alta: <span class="red-text big-text">$' +
    data.topBet +
    ' </span>   |    Bote: <span class="green-text big-text">$' +
    data.pot + '</span>'
  )
  $('#opponentCards').html(
    data.players.map(function (p) {
      return renderOpponent(p.username, {
        text: p.status,
        money: p.money,
        blind: p.blind,
        bets: data.bets,
        buyIns: p.buyIns,
        isChecked: p.isChecked,
      })
    })
  )
  renderSelf({
    money: data.myMoney,
    text: data.myStatus,
    blind: data.myBlind,
    bets: data.bets,
    buyIns: data.buyIns,
  })
  if (!data.roundInProgress) {
    $('#usernameFold').hide()
    $('#usernameCheck').hide()
    $('#usernameBet').hide()
    $('#usernameCall').hide()
    $('#usernameRaise').hide()
  }
})

socket.on('gameBegin', function (data) {
  $('#navbar-ptwu').hide()
  $('#joinModal').closeModal()
  $('#hostModal').closeModal()
  if (data == undefined) {
    alert('Error - invalid game.')
  } else {
    $('#gameDiv').show()
  }
})

function playNext() {
  socket.emit('startNextRound', {})
}

socket.on('reveal', function (data) {
  $('#usernameFold').hide()
  $('#usernameCheck').hide()
  $('#usernameBet').hide()
  $('#usernameCall').hide()
  $('#usernameRaise').hide()

  for (var i = 0; i < data.winners.length; i++) {
    if (data.winners[i] == data.username) {
      Materialize.toast('Has ganado la partida!', 4000)
      break
    }
  }
  $('#table-title').html('Ganador(es): <span class="green-text">' + data.winners + '</span>')

  $('#playNext').html(
    '<button onClick=playNext() id="playNextButton" class="btn red white-text menuButtons">Comenzar nueva ronda!</button>'
  )

  $('#blindStatus').text(data.hand)
  $('#usernamesMoney').text('$' + data.money)
  $('#opponentCards').html(
    data.cards.map(function (p) {
      return renderOpponentCards(p.username, {
        cards: p.cards,
        folded: p.folded,
        money: p.money,
        endHand: p.hand,
        buyIns: p.buyIns,
      })
    })
  )
})

socket.on('endHand', function (data) {
  $('#usernameFold').hide()
  $('#usernameCheck').hide()
  $('#usernameBet').hide()
  $('#usernameCall').hide()
  $('#usernameRaise').hide()
  $('#table-title').text(data.winner + ' se lleva un bote de $' + data.pot)

  $('#playNext').html(
    '<button onClick=playNext() id="playNextButton" class="btn red white-text menuButtons">Comenzar nueva ronda!</button>'
  )

  $('#blindStatus').text('')
  if (data.folded == 'Fold') {
    $('#status').text('Has abandonado')
    $('#playerInformationCard').removeClass('theirTurn')
    $('#usernameFold').hide()
    $('#usernameCheck').hide()
    $('#usernameBet').hide()
    $('#usernameCall').hide()
    $('#usernameRaise').hide()
  }
  $('#usernamesMoney').text('$' + data.money)
  $('#opponentCards').html(
    data.cards.map(function (p) {
      return renderOpponent(p.username, {
        text: p.text,
        money: p.money,
        blind: '',
        bets: data.bets,
      })
    })
  )
})

var beginHost = function () {
  if (!rdrCharacter.name) {
    $('.toast').hide()
    $('#hostModal').closeModal()
    Materialize.toast(
      'Ups. no hay baraja! Sal y entra de nuevo en la mesa.',
      4000
    )
    $('#joinButton').removeClass('disabled')
  } else {
    socket.emit('host', rdrCharacter)
    $('#joinButton').addClass('disabled')
    $('#joinButton').off('click')
  }
}

var joinRoom = function () {
  // yes, i know this is client-side.
  if (
    !rdrCharacter.name ||
    $('#code-field').val() === ''
  ) {
    $('.toast').hide()
    Materialize.toast(
      'El código no es válido o la mesa ha superado el máximo de ' + maxPlayers + ' jugadores',
      4000
    )
    $('#joinModal').closeModal()
    $('#hostButton').removeClass('disabled')
    $('#hostButton').on('click')
  } else {
    socket.emit('join', {
      code: $('#code-field').val(),
      rdrCharacter
    })
    $('#hostButton').addClass('disabled')
    $('#hostButton').off('click')
  }
}

var startGame = function (gameCode) {
  socket.emit('startGame', { code: gameCode })
}

var fold = function () {
  socket.emit('moveMade', { move: 'fold', bet: 'Fold' })
}

var bet = function () {
  console.log(`apostando ${parseFloat($('#betRangeSlider').val())}`)
  if (parseFloat($('#betRangeSlider').val()) == 0) {
    Materialize.toast('La apuesta tiene que ser mayor a 0.', 4000)
  } else if (parseFloat($('#betRangeSlider').val()) < 0.5) {
    Materialize.toast('La apuesta mínima son 50 centavos.', 4000)
  } else if (parseFloat($('#betRangeSlider').val()) > 20) {
    Materialize.toast('La apuesta máxima son 20 dólares.', 4000)
  } else {
    socket.emit('moveMade', {
      move: 'bet',
      bet: parseFloat($('#betRangeSlider').val()),
    })
  }
}

function call() {
  socket.emit('moveMade', { move: 'call', bet: 'Call' })
}

var check = function () {
  socket.emit('moveMade', { move: 'check', bet: 'Check' })
}

var raise = function () {
  if (
    parseFloat($('#raiseRangeSlider').val()) == $('#raiseRangeSlider').prop('min')
  ) {
    Materialize.toast(
      'Tu apuesta tiene que ser mayor que la apuesta más alta.',
      4000
    )
  } else {
    socket.emit('moveMade', {
      move: 'raise',
      bet: parseFloat($('#raiseRangeSlider').val()),
    })
  }
}

function renderCard(card) {
  if (card.suit == '♠' || card.suit == '♣')
    return (
      '<div class="playingCard_black" id="card"' +
      card.value +
      card.suit +
      '" data-value="' +
      card.value +
      ' ' +
      card.suit +
      '"><img src="img/cards/' + card.image + '.png"></div>'
    )
  else
    return (
      '<div class="playingCard_red" id="card"' +
      card.value +
      card.suit +
      '" data-value="' +
      card.value +
      ' ' +
      card.suit +
      '"><img src="img/cards/' + card.image + '.png"></div>'
    )
}

function renderOpponent(name, data) {
  var bet = 0
  if (data.bets != undefined) {
    var arr = data.bets[data.bets.length - 1]
    for (var pn = 0; pn < arr.length; pn++) {
      if (arr[pn].player == name) bet = arr[pn].bet
    }
  }
  var buyInsText =
    data.buyIns > 0 ? (data.buyIns > 1 ? 'buy-ins' : 'buy-in') : ''
  if (data.buyIns > 0) {
    if (data.text == 'Fold') {
      return (
        '<div class="col s8 m2 opponentCard"><div class="card"><div class="card-content white-text"><span class="card-title">' +
        name +
        ' Ha abandonado</span><p><div class="center-align"><div class="blankCard" id="opponent-card" /><div class="blankCard" id="opponent-card" /></div>' +
        data.blind +
        '<br />' +
        data.text +
        '</p></div><div class="card-action white-text center-align" style="font-size: 20px;">$' +
        data.money +
        ' (' +
        data.buyIns +
        ' ' +
        buyInsText +
        ')' +
        '</div></div></div>'
      )
    } else {
      if (data.text == 'TURNO') {
        if (data.isChecked)
          return (
            '<div class="col s8 m2 opponentCard"><div class="card"><div class="card-content text-white"><span class="card-title">' +
            name +
            '<br />Ha pasado</span><p><div class="center-align"><div class="blankCard" id="opponent-card" /><div class="blankCard" id="opponent-card" /></div>' +
            data.blind +
            '<br />' +
            data.text +
            '</p></div><div class="card-action yellow lighten-1 white-text center-align" style="font-size: 20px;">$' +
            data.money +
            ' (' +
            data.buyIns +
            ' ' +
            buyInsText +
            ')' +
            '</div></div></div>'
          )
        else if (bet == 0) {
          return (
            '<div class="col s8 m2 opponentCard"><div class="card"><div class="card-content text-white"><span class="card-title">' +
            name +
            '</span><p><div class="center-align"><div class="blankCard" id="opponent-card" /><div class="blankCard" id="opponent-card" /></div>' +
            data.blind +
            '<br />' +
            data.text +
            '</p></div><div class="card-action yellow lighten-1 white-text center-align" style="font-size: 20px;">$' +
            data.money +
            ' (' +
            data.buyIns +
            ' ' +
            buyInsText +
            ')' +
            '</div></div></div>'
          )
        } else {
          return (
            '<div class="col s8 m2 opponentCard"><div class="card"><div class="card-content text-white"><span class="card-title">' +
            name +
            '<br />Apuesta: $' +
            bet +
            '</span><p><div class="center-align"><div class="blankCard" id="opponent-card" /><div class="blankCard" id="opponent-card" /></div>' +
            data.blind +
            '<br />' +
            data.text +
            '</p></div><div class="card-action yellow lighten-1 white-text center-align" style="font-size: 20px;">$' +
            data.money +
            ' (' +
            data.buyIns +
            ' ' +
            buyInsText +
            ')' +
            '</div></div></div>'
          )
        }
      } else {
        if (data.isChecked)
          return (
            '<div class="col s8 m2 opponentCard"><div class="card" ><div class="card-content white-text"><span class="card-title">' +
            name +
            '<br />Pasó</span><p><div class="center-align"><div class="blankCard" id="opponent-card" /><div class="blankCard" id="opponent-card" /></div>' +
            data.blind +
            '<br />' +
            data.text +
            '</p></div><div class="card-action white-text center-align" style="font-size: 20px;">$' +
            data.money +
            ' (' +
            data.buyIns +
            ' ' +
            buyInsText +
            ')' +
            '</div></div></div>'
          )
        else if (bet == 0) {
          return (
            '<div class="col s8 m2 opponentCard"><div class="card" ><div class="card-content white-text"><span class="card-title">' +
            name +
            '</span><p><div class="center-align"><div class="blankCard" id="opponent-card" /><div class="blankCard" id="opponent-card" /></div>' +
            data.blind +
            '<br />' +
            data.text +
            '</p></div><div class="card-action white-text center-align" style="font-size: 20px;">$' +
            data.money +
            ' (' +
            data.buyIns +
            ' ' +
            buyInsText +
            ')' +
            '</div></div></div>'
          )
        } else {
          return (
            '<div class="col s8 m2 opponentCard"><div class="card" ><div class="card-content white-text"><span class="card-title">' +
            name +
            '<br />Apuesta: $' +
            bet +
            '</span><p><div class="center-align"><div class="blankCard" id="opponent-card" /><div class="blankCard" id="opponent-card" /></div>' +
            data.blind +
            '<br />' +
            data.text +
            '</p></div><div class="card-action white-text center-align" style="font-size: 20px;">$' +
            data.money +
            ' (' +
            data.buyIns +
            ' ' +
            buyInsText +
            ')' +
            '</div></div></div>'
          )
        }
      }
    }
  }
  // buy-ins rendering
  else {
    if (data.text == 'Fold') {
      return (
        '<div class="col s8 m2 opponentCard"><div class="card"><div class="card-content white-text"><span class="card-title">' +
        name +
        '<br />' +
        ' Abandonó</span><p><div class="center-align"><div class="blankCard" id="opponent-card" /><div class="blankCard" id="opponent-card" /></div>' +
        data.blind +
        '<br />' +
        data.text +
        '</p></div><div class="card-action white-text center-align" style="font-size: 20px;">$' +
        data.money +
        '</div></div></div>'
      )
    } else {
      if (data.text == 'TURNO') {
        if (data.isChecked)
          return (
            '<div class="col s8 m2 opponentCard"><div class="card"><div class="card-content white-text"><span class="card-title white-text">' +
            name +
            '<br />Pasó</span><p><div class="center-align"><div class="blankCard" id="opponent-card" /><div class="blankCard" id="opponent-card" /></div>' +
            data.blind +
            '<br />' +
            '<span class="red-text">' + data.text + '</span>' +
            '<br />$' +
            data.money +
            '</div>'
          )
        else if (bet == 0) {
          return (
            '<div class="col s8 m2 opponentCard"><div class="card"><div class="card-content white-text"><span class="card-title white-text">' +
            name +
            '<br />' +
            '</span><p><div class="center-align"><div class="blankCard" id="opponent-card" /><div class="blankCard" id="opponent-card" /></div>' +
            data.blind +
            '<br />' +
            '<span class="red-text">' + data.text + '</span>' +
            '<br />$' +
            data.money +
            '</div>'
          )
        } else {
          return (
            '<div class="col s8 m2 opponentCard"><div class="card"><div class="card-content white-text"><span class="card-title white-text">' +
            name +
            '<br />Apuesta: $' +
            bet +
            '</span><p><div class="center-align"><div class="blankCard" id="opponent-card" /><div class="blankCard" id="opponent-card" /></div>' +
            data.blind +
            '<br />' +
            '<span class="red-text">' + data.text + '</span>' +
            '<br />$' +
            data.money +
            '</div>'
          )
        }
      } else {
        if (data.isChecked)
          return (
            '<div class="col s8 m2 opponentCard"><div class="card" ><div class="card-content white-text"><span class="card-title">' +
            name +
            '<br />Pasó</span><p><div class="center-align"><div class="blankCard" id="opponent-card" /><div class="blankCard" id="opponent-card" /></div>' +
            data.blind +
            '<br />' +
            '<span class="red-text">' + data.text + '</span>' +
            '<br />$' +
            data.money +
            '</div>'
          )
        else if (bet == 0) {
          return (
            '<div class="col s8 m2 opponentCard"><div class="card" ><div class="card-content white-text"><span class="card-title">' +
            name +
            '<br />' +
            '</span><p><div class="center-align"><div class="blankCard" id="opponent-card" /><div class="blankCard" id="opponent-card" /></div>' +
            data.blind +
            '<br />' +
            '<span class="red-text">' + data.text + '</span>' +
            '<br />$' +
            data.money +
            '</div>'
          )
        } else {
          return (
            '<div class="col s8 m2 opponentCard"><div class="card" ><div class="card-content white-text"><span class="card-title">' +
            name +
            '<br />Apuesta: $' +
            bet +
            '<br />' +
            '</span><p><div class="center-align"><div class="blankCard" id="opponent-card" /><div class="blankCard" id="opponent-card" /></div>' +
            data.blind +
            '<br />' +
            '<span class="red-text">' + data.text + '</span>' +
            '<br />$' +
            data.money +
            '</div>'
          )
        }
      }
    }
  }
}

function renderOpponentCards(name, data) {
  var bet = 0
  if (data.bets != undefined) {
    var arr = data.bets[data.bets.length - 1].reverse()
    for (var pn = 0; pn < arr.length; pn++) {
      if (arr[pn].player == name) bet = arr[pn].bet
    }
  }
  var buyInsText2 =
    data.buyIns > 0 ? (data.buyIns > 1 ? 'buy-ins' : 'buy-in') : ''
  if (data.buyIns > 0) {
    if (data.folded)
      return (
        '<div class="col s8 m2 opponentCard"><div class="card" ><div class="card-content white-text"><span class="card-title">' +
        name +
        ' | Apuesta: $' +
        bet +
        '</span><p><div class="center-align"><div class="blankCard" id="opponent-card" /><div class="blankCard" id="opponent-card" /></div><br /></p></div><div class="card-action white-text center-align" style="font-size: 20px;">$' +
        data.money +
        ' (' +
        data.buyIns +
        ' ' +
        buyInsText2 +
        ')' +
        '</div></div></div>'
      )
    else
      return (
        '<div class="col s8 m2 opponentCard"><div class="card" ><div class="card-content white-text"><span class="card-title">' +
        name +
        ' | Apuesta: $' +
        bet +
        '</span><p><div class="center-align"> ' +
        renderOpponentCard(data.cards[0]) +
        renderOpponentCard(data.cards[1]) +
        ' </div>' +
        data.endHand +
        '</p></div><div class="card-action white-text center-align" style="font-size: 20px;">$' +
        data.money +
        ' (' +
        data.buyIns +
        ' ' +
        buyInsText2 +
        ')' +
        '</div></div></div>'
      )
  } else {
    if (data.folded)
      return (
        '<div class="col s8 m2 opponentCard"><div class="card" ><div class="card-content white-text"><span class="card-title">' +
        name +
        ' | Apuesta: $' +
        bet +
        '</span><p><div class="center-align"><div class="blankCard" id="opponent-card" /><div class="blankCard" id="opponent-card" /></div><br /></p></div><div class="card-action white-text center-align" style="font-size: 20px;">$' +
        data.money +
        '</div></div></div>'
      )
    else
      return (
        '<div class="col s8 m2 opponentCard"><div class="card" ><div class="card-content white-text"><span class="card-title">' +
        name +
        ' | Apuesta: $' +
        bet +
        '</span><p><div class="center-align"> ' +
        renderOpponentCard(data.cards[0]) +
        renderOpponentCard(data.cards[1]) +
        ' </div>' +
        data.endHand +
        '</p></div><div class="card-action white-text center-align" style="font-size: 20px;">$' +
        data.money +
        '</div></div></div>'
      )
  }
}

function renderOpponentCard(card) {
  if (card.suit == '♠' || card.suit == '♣')
    return (
      '<div class="playingCard_black_opponent" id="card"' +
      card.value +
      card.suit +
      '" data-value="' +
      card.value +
      ' ' +
      card.suit +
      '">' +
      card.value +
      ' ' +
      card.suit +
      '</div>'
    )
  else
    return (
      '<div class="playingCard_red_opponent" id="card"' +
      card.value +
      card.suit +
      '" data-value="' +
      card.value +
      ' ' +
      card.suit +
      '">' +
      card.value +
      ' ' +
      card.suit +
      '</div>'
    )
}

function updateBetDisplay() {
  if ($('#betRangeSlider').val() == $('#usernamesMoney').text()) {
    $('#betDisplay').html(
      '<h3 class="center-align">Apuesta todo $' +
      $('#betRangeSlider').val() +
      '</h36>'
    )
  } else {
    $('#betDisplay').html(
      '<h3 class="center-align"> Apuestas: $' + $('#betRangeSlider').val() + '</h3>'
    )
  }
}

function updateBetModal() {
  $('#betDisplay').html('<h3 class="center-align">$0</h3>')
  document.getElementById('betRangeSlider').value = 0
  var usernamesMoneyStr = $('#usernamesMoney').text().replace('$', '')
  var usernamesMoneyNum = parseInt(usernamesMoneyStr)
  $('#betRangeSlider').attr({
    max: 20,
    min: 0,
  })
}

function updateRaiseDisplay() {
  $('#raiseDisplay').html(
    '<h3 class="center-align">Subes a: $' +
    $('#raiseRangeSlider').val() +
    '</h3>'
  )
}

socket.on('updateRaiseModal', function (data) {
  $('#raiseRangeSlider').attr({
    max: 20,
    min: data.topBet,
  })
})

function updateRaiseModal() {
  document.getElementById('raiseRangeSlider').value = 0
  socket.emit('raiseModalData', {})
}

socket.on('displayPossibleMoves', function (data) {
  if (data.fold == 'yes') $('#usernameFold').show()
  else $('#usernameHide').hide()
  if (data.check == 'yes') $('#usernameCheck').show()
  else $('#usernameCheck').hide()
  if (data.bet == 'yes') $('#usernameBet').show()
  else $('#usernameBet').hide()
  if (data.call != 'no' || data.call == 'all-in') {
    $('#usernameCall').show()
    if (data.call == 'all-in') $('#usernameCall').text('Lo apuesta todo!')
    else $('#usernameCall').text('Ir a $' + data.call)
  } else $('#usernameCall').hide()
  if (data.raise == 'yes') $('#usernameRaise').show()
  else $('#usernameRaise').hide()
})

function renderSelf(data) {
  myMoney = data.money;
  $('#playNext').empty()
  $('#usernamesMoney').text('$' + data.money)
  if (data.text == 'TURNO') {
    $('#status').text('Mi turno')
    Materialize.toast('Mi turno', 4000)
    socket.emit('evaluatePossibleMoves', {})
  } else if (data.text == 'Fold') {
    $('#status').text('Has abandonado')
    Materialize.toast('Has abandonado', 3000)
    $('#usernameFold').hide()
    $('#usernameCheck').hide()
    $('#usernameBet').hide()
    $('#usernameCall').hide()
    $('#usernameRaise').hide()
  } else {
    $('#status').text('')
    $('#usernameFold').hide()
    $('#usernameCheck').hide()
    $('#usernameBet').hide()
    $('#usernameCall').hide()
    $('#usernameRaise').hide()
  }
  $('#blindStatus').text(data.blind)
}

function disconnectFromServer() {
  console.log(Math.round(myMoney));
  // parent.playerDisconnected(Math.round(myMoney))
  setTimeout(() => {
    location.reload();
  }, 500)
}

$(document).keypress(function (event) {
  var keycode = (event.key ? event.key : event.which);
  if (keycode == 'g') {
    // parent.gPressed();
  }
});