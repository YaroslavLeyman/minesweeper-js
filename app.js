startGame(16, 16, 40);

function startGame(WIDTH, HEIGHT, BOMBS_COUNT) {
  const field = document.querySelector(".field"); // находим поле
  const cellsCount = WIDTH * HEIGHT; // считаем сколько клеток в поле
  field.innerHTML = "<button></button>".repeat(cellsCount); // для каждой клетки создали кнопку
  const cells = Array.from(field.children); // все кнопки сложили в один массив
  const numbers = new Array(cellsCount).fill(null); // новый массим с цифрами

  let closedCount = cellsCount; // оставшиеся закрытые ячейки
  let firstClick = true;
  let bombsLeft = BOMBS_COUNT; // новая переменная счетчик бомб

  // создали массив спрайтов(цифры для счетчиков)
  const digitsCountArray = Array.from({ length: 10 }, (_, i) => `num-${i}`);

  // создаем элемент счетчика бомб
  const bombCounterElem = document.querySelector(".counter-bombs");
  bombCounterElem.innerHTML = `
        <span class="bombs-digit ${
          digitsCountArray[Math.floor(bombsLeft / 100)]
        }"></span>
        <span class="bombs-digit ${
          digitsCountArray[Math.floor((bombsLeft % 100) / 10)]
        }"></span>
        <span class="bombs-digit ${digitsCountArray[bombsLeft % 10]}"></span>
    `;

  // генерация случайных бомб
  let bombs = Array.from({ length: cellsCount }, (_, i) => i);

  for (let i = bombs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bombs[i], bombs[j]] = [bombs[j], bombs[i]];
  }
  bombs = bombs.slice(0, BOMBS_COUNT);

  // секундомер для отслеживания времени до 999 секунд
  let tens = 0;
  let Interval;
  let secondsHundreds = 0;
  let secondsDozens = 0;
  let secondsUnits = 0;

  function startTimer() {
    tens++;
    if (tens > 99) {
      secondsUnits++;
      tens = 0;
    }
    if (secondsUnits > 9) {
      secondsDozens++;
      secondsUnits = 0;
    }
    if (secondsDozens > 9) {
      secondsHundreds++;
      secondsDozens = 0;
    }
    if (secondsHundreds === 9) {
      // устанавливаем время в постоянное положение 999
      secondsHundreds = 9;
      secondsDozens = 9;
      secondsUnits = 9;
      clearInterval(Interval); // останавливаем таймер тк после 999 секунд отсчет останавливается
    }
    innerTime(); // устанавливаем текущее время
  }

  function innerTime() {
    const stopwatchElem = document.querySelector(".stopwatch");
    stopwatchElem.innerHTML = `
            <span class="seconds-digit num-${secondsHundreds}"></span>
            <span class="seconds-digit num-${secondsDozens}"></span>
            <span class="seconds-digit num-${secondsUnits}"></span>
        `;
  }

  // отключаем контекстное меню
  document.oncontextmenu = function (e) {
    e.preventDefault();
    return false;
  };
  window.addEventListener("contextmenu", (e) => e.preventDefault());

  // отслеживаем нажатие на клетку в поле, меняем на испуганный смайл и обратно
  field.addEventListener("mousedown", (e) => {
    if (e.which === 1) {
      addScaredSmile();
    }
  });
  field.addEventListener("mouseup", (e) => {
    if (e.which === 1) {
      addOriginalSmile();
    }
  });

  // при клике на кнопку проверяем, что клик именно на кнопку
  field.addEventListener("click", (event) => {
    const target = event.target;
    if (target.tagName !== "BUTTON") {
      return;
    }

    // при клике ищем месторасположение ячейки в массиве
    const index = cells.indexOf(event.target);
    const column = index % WIDTH;
    const row = Math.floor(index / WIDTH);

    if (firstClick) {
      // запускаем таймер после первого клика
      clearInterval(Interval);
      Interval = setInterval(startTimer, 10);
    }

    if (firstClick && isBomb(row, column)) {
      bombs = Array.from({ length: cellsCount }, (_, i) => i);
      for (let i = bombs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [bombs[i], bombs[j]] = [bombs[j], bombs[i]];
      }
      bombs = bombs
        .slice(0, BOMBS_COUNT)
        .filter((bombIndex) => bombIndex !== index);

      cells[index].innerHTML = "";

      checkNumbers(cells[index], row, column, index);
    } else {
      open(row, column);

      checkWin();
    }

    firstClick = false;
  });

  // добавляем прослушиватель щелчка в каждую ячейку.
  // чтобы обрабатывать пометку и снятие пометки с бомб.
  // Внутри прослушивателя обновляем элемент счетчика бомб,
  // чтобы отразить текущее количество оставшихся бомб
  cells.forEach((cell, index) => {
    cell.addEventListener("mousedown", (event) => {
      event.preventDefault();
      if (event.which == 3) {
        // клик правой кнопкой
        if (cell.classList.contains("flag")) {
          cell.classList.remove("flag");
          cell.classList.add("question");
        } else if (cell.classList.contains("question")) {
          cell.classList.remove("question");
          bombsLeft++;
        } else {
          if (bombsLeft > 0) {
            cell.classList.add("flag");

            bombsLeft--;
          } else {
            cell.classList.add("question");
          }
        }

        const bombCounterDigits =
          bombCounterElem.querySelectorAll(".bombs-digit");
        bombCounterDigits[0].className = `bombs-digit ${
          digitsCountArray[Math.floor(bombsLeft / 100)]
        }`;
        bombCounterDigits[1].className = `bombs-digit ${
          digitsCountArray[Math.floor((bombsLeft % 100) / 10)]
        }`;
        bombCounterDigits[2].className = `bombs-digit ${
          digitsCountArray[bombsLeft % 10]
        }`;
      }
    });
  });

  // открываем все оставшиеся бомбы если проиграл
  function openBombs(index) {
    bombs.forEach((bombIndex) => {
      const cell = cells[bombIndex];
      if (bombIndex !== index) {
        cell.disabled = true;
        // добавили класс который показывает целые бомбы
        if (cell.classList.contains("flag")) {
          cell.classList.remove("flag");
          cell.classList.add("clear-bomb");
        } else {
          cell.classList.add("remaining-bombs");
        }
      }
    });
  }

  // проверка ячеек, является ли валидным число
  function isValid(row, column) {
    return row >= 0 && row < HEIGHT && column >= 0 && column < WIDTH;
  }

  // перебираем все соседние ячейки
  function getCount(row, column) {
    let count = 0;
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        if (isBomb(row + y, column + x)) {
          count++;
        }
      }
    }
    return count;
  }

  function checkNumbers(cell, row, column, index) {
    // если на поле цифра, применяем ей стили спрайтов
    let countDigit = getCount(row, column);
    if (countDigit !== 0) {
      closedCount--;
      numbers[index] = countDigit;
      cell.setAttribute("class", `field-digit-${countDigit}`);
      return;
    } else {
      closedCount--;
      numbers[index] = 0;
      cell.setAttribute("class", "field-digit-0");
    }
  }

  // находим index ячейки для того, чтобы в нее записывать значения
  function open(row, column) {
    if (!isValid(row, column)) return; // проверяем валидность чтобы не сломалось

    const index = row * WIDTH + column;
    const cell = cells[index];

    if (cell.classList.contains("flag")) return;
    if (cell.classList.contains("question")) return;
    // если ячейка уже открыта, то завершаем
    if (cell.disabled === true) return;
    cell.disabled = true;

    // если это бомба, добавляем нужный класс, останавливаем секундомер, показываем оставшиеся бомбы, грустный смайл
    if (isBomb(row, column)) {
      cell.classList.add("bomb");
      field.style.pointerEvents = "none";
      // останавливаем таймер
      clearInterval(Interval);

      addSadSmile();
      openBombs(index);
      return;
    }

    checkNumbers(cell, row, column, index);

    // считаем count
    const count = getCount(row, column);

    if (count !== 0) {
      cell.innerHTML = "";
      return;
    }

    // перебираем и открываем все соседние ячейки
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        open(row + y, column + x);
      }
    }
    checkWin();
  }

  function checkWin() {
    // если кол-во закрытых ячеек = кол-ву бомб, победа
    if (closedCount === BOMBS_COUNT) {
      clearInterval(Interval); // останавливаем таймер
      addCoolSmile();
      field.style.pointerEvents = "none";
    }
  }

  // вычисляем является ли ячейка бомбой
  function isBomb(row, column) {
    if (!isValid(row, column)) return false;
    const index = row * WIDTH + column;
    return bombs.includes(index);
  }

  // Рестарт игры по клику на смайл
  const smileRestartButton = document.querySelector(".smile");
  smileRestartButton.addEventListener("click", (event) => {
    location.reload();
  });

  // отслеживаем нажатие на смайл и меняем его на нажатый
  smileRestartButton.addEventListener("mousedown", (e) => {
    if (e.which === 1) {
      addPressedSmile();
    }
  });

  // добавляет оригинальный смайл
  function addOriginalSmile() {
    let originalSmile = document.querySelector(".smile");
    originalSmile.setAttribute("id", "smile");
  }

  // добаляет нажатый смайл
  function addPressedSmile() {
    let pressedSmile = document.querySelector(".smile");
    pressedSmile.setAttribute("id", "pressed-smile");
  }

  // добавляет испуганный смайл
  function addScaredSmile() {
    let scaredSmile = document.querySelector(".smile");
    scaredSmile.setAttribute("id", "scared-smile");
  }

  // добавляет крутой смайл
  function addCoolSmile() {
    let coolSmile = document.querySelector(".smile");
    coolSmile.setAttribute("id", "cool-smile");
  }

  // добавляет грустный смайл
  function addSadSmile() {
    let sadSmile = document.querySelector(".smile");
    sadSmile.setAttribute("id", "sad-smile");
  }
}
