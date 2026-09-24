// https://css-tricks.com/creating-a-parking-game-with-the-html-drag-and-drop-api/

let dragged;
window['moment-range'].extendMoment(moment);

const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const parkingRules = {
  ambulance: {
    days: ['Sunday', ...weekdays, 'Saturday']

  },

  suv: {
    days: ['Thursday'],
    times: createRange(
      moment().startOf('day').set('hour', 7),
      moment().startOf('day').set('hour', 12)
    )

  },

  car: {
    days: ['Monday'],
    times: createRange(
      moment().startOf('day').set('hour', 7),
      moment().startOf('day').set('hour', 20)
    )
  },

  motorcycle: {
    days: ['Sunday', ...weekdays, 'Saturday'],
    times: createRange(
      moment().startOf('day').set('hour', 7),
      moment().startOf('day').set('hour', 20)
    )
  }
};

function createRange(start, end) {
  if (start && end) {
    return moment.range(start, end);
  }
}

function onDragStart(event) {
  let target = event.target;

  if (target && target.nodeName === 'IMG') {
    dragged = target;
    target.style.opacity = .3;


    event.dataTransfer.setData('text', target.id);
  }
}

function onDragEnd(event) {
  if (event.target && event.target.nodeName === 'IMG') {
    event.target.style.opacity = '';
    dragged = null;
  }
}

function onDragOver(event) {
  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
}

function onDragLeave(event) {
  event.currentTarget.style.background = '';
}

function getDay() {
  return moment().format('dddd');
}

function getHours() {
  return moment().hour();
}

function canPark(vehicle) {
  if (vehicle && parkingRules[vehicle]) {
    const rules = parkingRules[vehicle];
    const validDays = rules.days;
    const validTimes = rules.times;
    const curDay = getDay();

    // O SUV é permitido, EXCETO quinta-feira das 7h às 12h.
    if (vehicle === 'suv') {
      return !(validDays.includes(curDay) && validTimes.contains(moment()));
    }

    // Ambulância, carro e moto seguem a regra de dias e horários.
    return validDays.includes(curDay) &&
      (validTimes ? validTimes.contains(moment()) : true);
  }

  return false;
}

function showMessage(vehicle, allowed) {
  const message = document.querySelector('#parking-message');

  if (allowed) {
    message.textContent = 'Estacionamento permitido com sucesso!';
    message.style.color = 'green';
  } else {
    if (vehicle === 'suv') {
      message.textContent =
        'Acesso negado: o SUV é proibido na quinta-feira das 7h às 12h!';
    } else if (vehicle === 'car') {
      message.textContent =
        'Acesso negado: o carro só pode estacionar na segunda-feira das 7h às 20h!';
    } else if (vehicle === 'motorcycle') {
      message.textContent =
        'Acesso negado: a moto só pode estacionar das 7h às 20h!';
    } else {
      message.textContent = 'Acesso negado para este veículo.';
    }

    message.style.color = 'red';
  }
}

function onDragEnter(event) {
  const target = event.currentTarget;

  if (dragged && target) {
    const vehicleType = dragged.alt;

    event.preventDefault();

    if (canPark(vehicleType)) {
      event.dataTransfer.dropEffect = 'move';
      target.style.background = '#1f904e';
    } else {
      target.style.background = '#d51c00';
    }
  }
}

function onDrop(event) {
  event.preventDefault();

  const target = event.currentTarget;
  const data = event.dataTransfer.getData('text');
  const draggedVehicle = document.getElementById(data);

  if (draggedVehicle) {
    const vehicleType = draggedVehicle.alt;
    const allowed = canPark(vehicleType);

    target.style.background = allowed ? '#1f904e' : '#d51c00';
    showMessage(vehicleType, allowed);

    if (allowed) {
      draggedVehicle.style.opacity = '';
      target.appendChild(draggedVehicle);
    }
  }
}

const vehicles = document.querySelector('.vehicles');
const dropZone = document.querySelector('.drop-zone');

vehicles.addEventListener('dragstart', onDragStart);
vehicles.addEventListener('dragend', onDragEnd);
dropZone.addEventListener('drop', onDrop);
dropZone.addEventListener('dragenter', onDragEnter);
dropZone.addEventListener('dragleave', onDragLeave);
dropZone.addEventListener('dragover', onDragOver);