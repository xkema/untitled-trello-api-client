// console.log('hola lola!');

// get page elements
let btnReport        = document.getElementById('utc-btn-create-report'),
    tableHolder      = document.getElementById('utc-table'),
    btnAuthorize     = document.getElementById('utc-btn-authorize'),
    btnAddMeeting    = document.getElementById('utc-btn-add-meeting'),
    radioTimeRange   = document.querySelectorAll('input[name="utc-time-range"]'),
    reportTextHolder = document.getElementById('utc-report-text');

// promise objects
let $a, // auth
    $u, // user
    $c; // cards

// temp app state
let $$state = {
  userId: null
};

// init
const initUtcApp = () => {
  // bind auth button listener
  $a = btnAuthorize.addEventListener('click', (event) => {
    UtcUtils.authorizeUserToApp(event).then(readyUtcApp, badThingsHappen);
  });
  // silent auth at startup
  $a = UtcUtils.authorizeUserToApp().then(readyUtcApp, badThingsHappen);
  // report button handlers
  btnReport.addEventListener('click', () => {
    let reportStatus = UtcUtils.createSimpleReport(collectCheckedCardReportStrings());
    if(false === reportStatus) {
      reportTextHolder.innerHTML = 'Nothing to report..';
    } else {
      reportTextHolder.innerHTML = reportStatus;      
    }
  });
  // add meeting button handlers
  btnAddMeeting.addEventListener('click', () => {
    if(-1 === reportTextHolder.innerHTML.search('Toplanti')) {
      if('Nothing to report..' === reportTextHolder.innerHTML || '' === reportTextHolder.innerHTML) {
        reportTextHolder.innerHTML = 'Toplanti';
      } else {
        reportTextHolder.innerHTML += ', Toplanti';
      }
    }
  });
  // add time range changed listeners
  radioTimeRange.forEach((radio) => {
    radio.addEventListener('change', (event) => {
      // send fetch cards request
      fetchCardsOfList(parseInt(event.target.value), $$state.userId);
    });
  });
}

// app authorized
const readyUtcApp = () => {
  // enable button, show loading info
  btnAuthorize.classList.add('utc-hidden');
  // fetch user data
  $u = UtcUtils.getMe();
  $u.then((value) => {
    $$state.userId = value.id;
    // get initially selected radio button
    let initiallySelectedRadio = document.querySelector('input[name="utc-time-range"]:checked');
    // send fetch cards request
    fetchCardsOfList(parseInt(initiallySelectedRadio.value), $$state.userId);
  }, badThingsHappen);
}

// send get cards request
const fetchCardsOfList = (numDays, userId) => {
  // replace table content with loading message
  tableHolder.innerHTML = 'updating table data..';
  // get cards
  $c = UtcUtils.getCardsOfList('581c53dac5f591ba7be90d2c', parseInt(numDays));
  // fetch cards of list data
  $c.then((value) => {
    // user cards only
    let userCardsOnly = UtcUtils.filterCardsOfuser(value, userId)
    // sort cards by idShort
    UtcUtils.sortCardsByIdShort(userCardsOnly);
    // prepare cards table
    tableHolder.innerHTML = UtcUtils.renderCardsTable(userCardsOnly);
    // todo :: unbind older events maybe?
    // bind listeners to table elements
    bindTableListeners();
  }, badThingsHappen);
}

// error handler for all
const badThingsHappen = (...args) => {
  if('undefined' === typeof args[0]) {
    console.log('ERROR GENERIC :: something bad happened, authorization failure maybe?');
    btnAuthorize.classList.remove('utc-hidden');
  } else {
    console.log(`ERROR :: status: ${args[0].status}, details: ${args[0].responseText}`);
    if(401 === args[0].status) {
      UtcUtils.deAuthorizeUserFromApp();
    }
  }
}

// bind table listeners
const bindTableListeners = () => {
  // checkbox toggler
  document.getElementById('utc-data-table').addEventListener('click', (e) => { 
    if('td' === e.target.nodeName.toLowerCase()) {
      let checkbox = e.target.parentElement.firstElementChild.firstElementChild;
      checkbox.checked = !checkbox.checked;
    }
  });
}

// collect checkboxes clicked
const collectCheckedCardReportStrings = () => {
  let checkboxes = Array.prototype.slice.call(tableHolder.querySelectorAll('input'));
  return checkboxes.filter((checkbox) => {
    return checkbox.checked;
  }).map((input) => {
    return input.dataset.reportString;
  });
}

// bind listeners
document.addEventListener('DOMContentLoaded', initUtcApp);
