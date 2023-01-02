const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardsMatchFailed: "CardsMatchFailed",
  CardsMatched: "CardsMatched",
  GameFinished: "GameFinished",

}

const Symbols = [
  //黑桃
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png',
  //愛心
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png',
  //鑽石
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png',
  //梅花
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png'
]

const view = {
  // 把函式宣告在物件裡，這樣找函式的時候會更快
  getCardElement(index) {
    return `<div data-index="${index}" class="card back"></div>`
  },

  getCardContent(index) {
    // 產數字和花色
    const number = this.transformNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)]

    return `<p>${number}</p>
      <img src="${symbol}">
      <p>${number}</p>`
  },

  transformNumber(number) {
    //1，11，12，13產出A、J、Q、K
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },

  displayCards(indexs) {
    const rootElement = document.querySelector('#cards')
    rootElement.innerHTML = indexs.map(index => this.getCardElement(index)).join('')
  },

  //flipCards(1,2,3,4,5)
  //cards = [1,2,3,4,5]
  flipCards(...cards) {
    cards.map(card => {
      if (card.classList.contains('back')) {
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(Number(card.dataset.index))
        return
      }

      card.classList.add('back')
      card.innerHTML = null
    })
  },

  pairCards(...cards) {
    cards.map(card => {
      card.classList.add('paired')
    })
  },

  renderScore(score) {
    document.querySelector('.score').textContent = `Score:${score}`
  },

  renderTriedTimes(times) {
    document.querySelector('.tried').textContent = `You've tried: ${times} times`

  },
  appendWrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add('wrong')
      card.addEventListener('animationend', event => event.target.classList.remove('wrong'), { once: true })
    })
  },

  showGameFinished() {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>
    `
    const header = document.querySelector('#header')
    header.before(div)
  }
}

const model = {
  revealedCards: [],

  isRevealCardsMatched() {
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
  },

  score: 0,

  triedTimes: 0
}

const controller = {
  currentState: GAME_STATE.FirstCardAwaits,

  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52))
  },

  //依照不同的遊戲狀態，做不同的行為
  dispatchCardAction(card) {
    if (!card.classList.contains('back')) {
      return
    }

    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break

      case GAME_STATE.SecondCardAwaits:
        view.renderTriedTimes((++model.triedTimes))

        view.flipCards(card)
        model.revealedCards.push(card)
        //判斷配對是否成功

        if (model.isRevealCardsMatched()) {
          //配對正確
          view.renderScore(model.score += 10)
          this.currentState = GAME_STATE.CardsMatched
          view.pairCards(...model.revealedCards)
          model.revealedCards = []
          if (model.score === 260) {
            console.log('showGameFinished')
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()  // 加在這裡
            return
          }
          this.currentState = GAME_STATE.FirstCardAwaits
        } else {
          //配對失敗
          this.currentState = GAME_STATE.CardsMatchFailed
          view.appendWrongAnimation(...model.revealedCards)
          setTimeout(this.resetCards, 1000)
        }
        break

    }
    console.log('current state:', this.currentState)
    console.log('revealed cards:', model.revealedCards)
  },

  resetCards() {
    view.flipCards(...model.revealedCards)
    model.revealedCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits

  }
}

const utility = {
  getRandomNumberArray(count) {
    // count =5 =>[2,3,4,1,0]

    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1))
        ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }

    return number
  }
}



controller.generateCards()

//Node List (array-like)
//把每個card的物件抓出來變成一個nodelist，然後在每個card上產生事件監聽器
//console.log(card)可以檢查有沒有抓到點擊的那張卡片
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', event => {
    controller.dispatchCardAction(card)
  })
})